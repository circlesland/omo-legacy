// import {
//   graphql,
//   GraphQLSchema,
//   GraphQLObjectType,
//   GraphQLString,
// } from 'graphql';

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'RootQueryType',
//     fields: {
//       hello: {
//         type: GraphQLString,
//         resolve() {
//           return 'world';
//         },
//       },
//     },
//   }),
// });

// var AddressType = new GraphQLObjectType({
//   name: 'Address',
//   fields: {
//     street: { type: GraphQLString },
//     number: { type: GraphQLInt },
//     formatted: {
//       type: GraphQLString,
//       resolve(obj) {
//         return obj.number + ' ' + obj.street
//       }
//     }
//   }
// });

// var query = '{ hello }';

// graphql(schema, query).then((result) => {
//   console.log(result);
// });