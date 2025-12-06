export interface FAQQuestion {
	question: string;
	slug: string;
	answer: string;
}

export interface FAQSection {
	title: string;
	slug: string;
	questions: FAQQuestion[];
}

export const faqSections: FAQSection[] = [
	{
		title: 'Getting Started',
		slug: 'getting-started',
		questions: [
			{
				question: 'What is Buildboard?',
				slug: 'what-is-buildboard',
				answer: 'Buildboard is a program that immortalizes Hack Clubbers\' projects. Ship your passion project, document the journey, and get featured on a billboard in NYC or near you. This is your time to show the whole world what you\'ve built.'
			},
			{
				question: 'How do I sign up for Buildboard?',
				slug: 'how-do-i-sign-up',
				answer: 'You can sign up for Buildboard by visiting our homepage and clicking the "Sign Up" button. You\'ll need to create an account using your email address or sign in with your existing Hack Club account.'
			},
			{
				question: 'Who is eligible to participate?',
				slug: 'who-is-eligible',
				answer: 'Buildboard is open to all Hack Club members and young makers who have built a project they\'re proud of. Whether you\'re a beginner or experienced developer, if you\'ve created something meaningful, we want to see it!'
			},
			{
				question: 'What kind of projects can I submit?',
				slug: 'what-kind-of-projects',
				answer: 'You can submit any technical project you\'ve built - websites, apps, games, hardware projects, art installations, and more. The key is that it should be something you\'re passionate about and have put real effort into creating.'
			},
			{
				question: 'Is there a deadline to submit my project?',
				slug: 'is-there-a-deadline',
				answer: 'Buildboard accepts submissions on a rolling basis. However, billboard display opportunities are limited, so we encourage you to submit as soon as your project is ready to share with the world.'
			},
			{
				question: 'Do I need to be a Hack Club member?',
				slug: 'do-i-need-to-be-a-member',
				answer: 'While Buildboard is primarily designed for the Hack Club community, we welcome all young makers who share our passion for building and creating. If you\'re not yet a Hack Club member, consider joining!'
			}
		]
	},
	{
		title: 'Submitting Your Project',
		slug: 'submitting-your-project',
		questions: [
			{
				question: 'How do I submit my project?',
				slug: 'how-do-i-submit',
				answer: 'To submit your project, log into your Buildboard account and navigate to the submission page. You\'ll need to provide details about your project, upload images or videos, and share the story behind what you built.'
			},
			{
				question: 'What information do I need to provide?',
				slug: 'what-information-do-i-need',
				answer: 'You\'ll need to provide your project name, a description of what it does, the technologies you used, images or screenshots, and optionally a link to a live demo or repository. The more detail you provide, the better!'
			},
			{
				question: 'Can I submit multiple projects?',
				slug: 'can-i-submit-multiple-projects',
				answer: 'Yes! You can submit as many projects as you\'d like. Each project will be reviewed individually for potential billboard display.'
			},
			{
				question: 'Can I edit my submission after submitting?',
				slug: 'can-i-edit-my-submission',
				answer: 'Yes, you can edit your submission at any time before it\'s been selected for display. Simply log into your account and navigate to your submissions to make changes.'
			},
			{
				question: 'What makes a strong submission?',
				slug: 'what-makes-a-strong-submission',
				answer: 'Strong submissions tell a compelling story, include high-quality visuals, and demonstrate genuine passion and effort. Focus on what makes your project unique and why it matters to you.'
			}
		]
	},
	{
		title: 'The Billboard',
		slug: 'the-billboard',
		questions: [
			{
				question: 'Where will the billboard be located?',
				slug: 'where-will-the-billboard-be',
				answer: 'Our primary billboard is located in New York City, but we\'re expanding to additional locations. Check our announcements for the latest billboard locations near you.'
			},
			{
				question: 'How long will my project be displayed?',
				slug: 'how-long-will-it-be-displayed',
				answer: 'Display duration varies depending on the billboard location and rotation schedule. Typically, projects are displayed for several days to a week. You\'ll be notified of the exact timing when your project is selected.'
			},
			{
				question: 'How are projects selected for the billboard?',
				slug: 'how-are-projects-selected',
				answer: 'Projects are reviewed by our team based on creativity, effort, impact, and how well they represent the maker spirit. We aim to showcase a diverse range of projects from our community.'
			},
			{
				question: 'Will I be notified if my project is selected?',
				slug: 'will-i-be-notified',
				answer: 'Absolutely! If your project is selected for the billboard, you\'ll receive an email notification with all the details, including when and where your project will be displayed.'
			},
			{
				question: 'Can I get a photo of my project on the billboard?',
				slug: 'can-i-get-a-photo',
				answer: 'Yes! We capture photos and videos of all displayed projects and share them with the creators. You\'ll have something awesome to share with friends, family, and your portfolio.'
			}
		]
	},
	{
		title: 'Account & Profile',
		slug: 'account-and-profile',
		questions: [
			{
				question: 'How do I create an account?',
				slug: 'how-do-i-create-an-account',
				answer: 'Visit the Buildboard homepage and click "Sign Up." You can create an account using your email address or sign in with your existing Hack Club credentials.'
			},
			{
				question: 'How do I reset my password?',
				slug: 'how-do-i-reset-my-password',
				answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a link to reset your password.'
			},
			{
				question: 'Can I change my display name or handle?',
				slug: 'can-i-change-my-display-name',
				answer: 'Yes, you can update your display name and handle in your account settings. Note that your handle must be unique and may affect your public profile URL.'
			},
			{
				question: 'How do I delete my account?',
				slug: 'how-do-i-delete-my-account',
				answer: 'To delete your account, please contact our support team. Note that deleting your account will also remove all your submitted projects.'
			}
		]
	},
	{
		title: 'Technical Issues',
		slug: 'technical-issues',
		questions: [
			{
				question: "The website isn't loading properly. What should I do?",
				slug: 'website-not-loading',
				answer: 'Try clearing your browser cache and cookies, then refresh the page. If the issue persists, try using a different browser or device. You can also check our status page for any ongoing issues.'
			},
			{
				question: "I'm having trouble uploading my project. What should I do?",
				slug: 'trouble-uploading',
				answer: 'Make sure your images are in a supported format (JPG, PNG, GIF) and under the file size limit. Check your internet connection and try again. If problems continue, contact our support team.'
			},
			{
				question: "My submission didn't go through. What happened?",
				slug: 'submission-didnt-go-through',
				answer: 'Check your internet connection and try submitting again. Make sure all required fields are filled out. If you continue to have issues, contact support with details about the error you\'re seeing.'
			},
			{
				question: 'Who do I contact for technical support?',
				slug: 'who-do-i-contact-for-support',
				answer: 'You can reach our support team by emailing support@buildboard.com or through the contact form on our website. We typically respond within 24-48 hours.'
			}
		]
	},
	{
		title: 'Other',
		slug: 'other',
		questions: [
			{
				question: 'Who do I contact with additional questions?',
				slug: 'who-do-i-contact',
				answer: 'For general questions, you can reach us at hello@buildboard.com or join the Hack Club Slack where our team is active. We\'re always happy to help!'
			},
			{
				question: 'Can I volunteer or help with Buildboard?',
				slug: 'can-i-volunteer',
				answer: 'We love community involvement! If you\'re interested in helping with Buildboard, reach out to us via email or Slack. We have opportunities for designers, developers, and community advocates.'
			},
			{
				question: 'Is Buildboard open source?',
				slug: 'is-buildboard-open-source',
				answer: 'Yes! Buildboard is open source and we welcome contributions from the community. Check out our GitHub repository to see the code, report issues, or submit pull requests.'
			}
		]
	}
];

export function getFAQSection(sectionSlug: string): FAQSection | undefined {
	return faqSections.find((s) => s.slug === sectionSlug);
}

export function getFAQQuestion(sectionSlug: string, questionSlug: string): { section: FAQSection; question: FAQQuestion } | undefined {
	const section = getFAQSection(sectionSlug);
	if (!section) return undefined;
	
	const question = section.questions.find((q) => q.slug === questionSlug);
	if (!question) return undefined;
	
	return { section, question };
}
