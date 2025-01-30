export function classes(conditions: object): string
{
	return Object.entries(conditions)
		.filter(([,value]: [string, boolean]) => value)
		.map(([key,]) => key)
		.join(' ');
}