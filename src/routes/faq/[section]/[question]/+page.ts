import { getFAQQuestion } from '$lib/data/faq';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const result = getFAQQuestion(params.section, params.question);
	
	if (!result) {
		throw error(404, 'Question not found');
	}
	
	return {
		section: result.section,
		question: result.question
	};
};
