const { default: Plausible } = require('../dist/cjs/index')

const apiKey = process.env['PLAUSIBLE_API_KEY']
const siteId = process.env['PLAUSIBLE_SITE_ID']

const p = new Plausible(apiKey, siteId)

;(async () => {
	const res = await p.getAggregate({
		period: 'custom',
		metrics: ['pageviews'],
		date: {
			from: new Date('1970-01-01'),
			to: new Date('2050-01-01')
		},
		filters: {
			operator: ';',
			children: [
				{
					property: 'event:page',
					operator: '==',
					value: {
						operator: '|',
						values: ['/dashboard*', '/love*']
					}
				},
				{
					property: 'event:hostname',
					operator: '==',
					value: 'socket.dev'
				}
			]
		}
	})

	console.log(res)
})()
