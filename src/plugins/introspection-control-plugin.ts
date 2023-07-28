import { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener } from '@apollo/server'
import { GraphQLContext, isIntrospectionQuery } from '@tuanbloom/graphql-core'
import { isProduction } from '@tuanbloom/node-common'

export const introspectionControlPlugin: ApolloServerPlugin<GraphQLContext> = {
  requestDidStart: ({
    request: { query },
    contextValue: { user },
  }: GraphQLRequestContext<GraphQLContext>): Promise<GraphQLRequestListener<GraphQLContext> | void> => {
    if (isProduction && !user && isIntrospectionQuery(query)) throw new Error('Unauthenticated introspection is not supported')
    return Promise.resolve()
  },
}
