import { CodegenConfig } from '@graphql-codegen/cli'

const contentfulSpaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID

const contentfulEnvironment =
	process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID

const contentfulAccessToken =
	process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN

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
