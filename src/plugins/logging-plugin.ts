import { GraphQLFormattedError } from 'graphql'
import { ApolloServerPlugin, GraphQLRequestContextWillSendResponse, GraphQLRequestListener } from '@apollo/server'
import { GraphQLRequestContextWillSendSubsequentPayload } from '@apollo/server/dist/esm/externalTypes/requestPipeline'
import { GraphQLContext, logGraphQLOperation } from '@tuanbloom/graphql-core'
import type { Logger } from '@tuanbloom/node-common'

export interface GraphQLRequestInfo<TContext extends GraphQLContext<any, any, any>> {
  readonly requestContext: GraphQLRequestContextWillSendResponse<TContext>
  readonly isSubsequentPayload: boolean
  readonly formattedErrors?: ReadonlyArray<GraphQLFormattedError>
}

export interface LoggingPluginOptions<TContext extends GraphQLContext<any, any, any>> {
  shouldIgnore?: (request: GraphQLRequestInfo<TContext>) => boolean
}

export function createLoggingPlugin<TContext extends GraphQLContext<TLogger, any, any>, TLogger extends Logger = Logger>(
  options: LoggingPluginOptions<TContext>
): ApolloServerPlugin<TContext> {
  return {
    requestDidStart: ({ contextValue: { started, logger } }): Promise<GraphQLRequestListener<TContext>> => {
      function logIfNotIgnore(ctx: GraphQLRequestContextWillSendResponse<TContext>, isSubsequentPayload: boolean) {
        const errors = ctx.response.body.kind === 'single' ? ctx.response.body.singleResult.errors : ctx.response.body.initialResult.errors
        if (
          !(
            options.shouldIgnore &&
            options.shouldIgnore({
              requestContext: ctx,
              isSubsequentPayload,
              formattedErrors: errors,
            })
          )
        ) {
          logGraphQLOperation({
            started,
            operationName: ctx.request.operationName,
            query: ctx.request.query,
            variables: ctx.request.variables,
            result: { errors },
            logger,
          })
        }
      }

      const responseListener: GraphQLRequestListener<TContext> = {
        willSendResponse(ctx: GraphQLRequestContextWillSendResponse<TContext>): Promise<void> {
          logIfNotIgnore(ctx, false)
          return Promise.resolve()
        },
        willSendSubsequentPayload(ctx: GraphQLRequestContextWillSendSubsequentPayload<TContext>): Promise<void> {
          logIfNotIgnore(ctx, false)
          return Promise.resolve()
        },
      }
      return Promise.resolve(responseListener)
    },
  }
}

/**
 * @deprecated use createLoggingPlugin() directly instead
 */
export const loggingPlugin: ApolloServerPlugin<GraphQLContext> = createLoggingPlugin({})
