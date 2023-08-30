import { CodegenConfig } from '@graphql-codegen/cli'

const contentfulSpaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || 'u9c8r3tap7y9'

const contentfulEnvironment =
	process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID || 'master'

const contentfulAccessToken =
	process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN || 'Q3TKc-AXX6X7S72PeS1abvrPoUBgepusXdCNJnVoz-g'

const contentfulSchema =
	`https://graphql.contentful.com/content/v1/spaces/${contentfulSpaceId}/environments/${contentfulEnvironment}` as string

const config: CodegenConfig = {
	generates: {
		'./contentful-graphql.ts': {
			schema: [
				{
					[contentfulSchema]: {
						headers: {
							Authorization: `Bearer ${contentfulAccessToken}`,
						},
					},
				},
			],
			documents: ['./contentful/**/*.gql'],
			plugins: [
				'typescript',
				'typescript-operations',
				'typescript-react-apollo',
			],
		},
	},
}

export default config
