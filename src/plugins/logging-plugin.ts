import { GraphQLContext, logGraphQLOperation } from '@makerxstudio/graphql-core'
import { ApolloServerPlugin, GraphQLRequestContextWillSendResponse, GraphQLRequestListener } from 'apollo-server-plugin-base'

export const loggingPlugin: ApolloServerPlugin<GraphQLContext> = {
  requestDidStart: (): Promise<GraphQLRequestListener<GraphQLContext>> => {
    const responseListener: GraphQLRequestListener<GraphQLContext> = {
      willSendResponse({
        response: { errors },
        context: { started, logger },
        request: { query, variables, operationName },
      }: GraphQLRequestContextWillSendResponse<GraphQLContext>): Promise<void> {
        logGraphQLOperation({
          started,
          operationName,
          query,
          variables,
          result: { errors },
          logger,
        })
        return Promise.resolve()
      },
    }
    return Promise.resolve(responseListener)
  },
}
