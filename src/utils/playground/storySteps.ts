/**
 * Story mode: nine steps from text to the next word.
 *
 * `highlight` lists the textbook pages (src/utils/textbookPages.ts) whose `on()` /
 * `out()` handlers light up the matching part of the diagram, so Story mode and the
 * textbook share one set of highlight rules.
 */
export type StoryVisual =
	| 'tokens'
	| 'embeddings'
	| 'positions'
	| 'attention'
	| 'heads'
	| 'mlp'
	| 'residual'
	| 'stack'
	| 'race';

export interface StoryStep {
	id: string;
	/** Short name for the progress rail. */
	short: string;
	title: string;
	/** Plain-language paragraphs. */
	body: string[];
	/** One sentence to take away. */
	takeaway: string;
	visual: StoryVisual;
	highlight: string[];
	/** Diagram parts kept bright while the rest is dimmed (step classes and Sankey path groups). */
	spot: string[];
}

export const storySteps: StoryStep[] = [
	{
		id: 'tokens',
		short: 'Tokens',
		title: 'Text becomes tokens',
		body: [
			'The model never reads letters or whole sentences. A tokenizer first cuts your text into tokens: whole words, pieces of words or punctuation.',
			'GPT-2 knows 50,257 different tokens, and each one has its own ID number. Look at how a long or rare word can be split into pieces.'
		],
		takeaway: 'Tokens are the units the model works with, and each is just an ID number.',
		visual: 'tokens',
		highlight: ['token-embedding'],
		spot: ['embedding']
	},
	{
		id: 'embeddings',
		short: 'Embeddings',
		title: 'Each token becomes a list of numbers',
		body: [
			'Each token ID picks one row from a big lookup table. That row is the token’s embedding: a list of 768 numbers.',
			'The numbers were learned during training, so tokens used in similar ways end up with similar lists. From here on, the model only works with these numbers.'
		],
		takeaway: 'An embedding is a token’s meaning written as 768 numbers.',
		visual: 'embeddings',
		highlight: ['token-embedding'],
		spot: ['embedding']
	},
	{
		id: 'positions',
		short: 'Position',
		title: 'Adding the position',
		body: [
			'Word order matters: “dog bites man” is not “man bites dog”. But an embedding alone says nothing about where a word sits.',
			'So GPT-2 adds a second list of 768 numbers that stands for the position (first, second, third…). The sum carries both the meaning and the place.'
		],
		takeaway: 'Meaning plus position: every token now knows what it is and where it is.',
		visual: 'positions',
		highlight: ['positional-encoding'],
		spot: ['embedding']
	},
	{
		id: 'attention',
		short: 'Attention',
		title: 'Attention: words look at each other',
		body: [
			'Now the tokens share information. From each token the model makes three new lists: a Query (“what am I looking for?”), a Key (“what do I offer?”) and a Value (“what will I pass on?”).',
			'Each Query is compared with the Keys of the tokens up to and including itself. Higher scores mean more attention, and softmax turns them into shares that add up to 100%. A mask hides the words that come later, so the model cannot peek ahead.'
		],
		takeaway: 'Attention lets each word gather what it needs from the words before it.',
		visual: 'attention',
		highlight: ['qkv'],
		spot: ['qkv', 'attention']
	},
	{
		id: 'heads',
		short: 'Many heads',
		title: 'Many heads, many points of view',
		body: [
			'GPT-2 runs 12 attention heads side by side in every block. Each head has its own Query, Key and Value weights, so each can learn a different habit: one may follow grammar, another may link a word back to a name.',
			'The 12 results are joined back into one list of 768 numbers and mixed by the output projection, W_O.'
		],
		takeaway: 'Twelve heads look at the same sentence in twelve different ways.',
		visual: 'heads',
		highlight: ['multi-head'],
		spot: ['attention']
	},
	{
		id: 'mlp',
		short: 'MLP',
		title: 'The MLP: thinking about each word',
		body: [
			'Next, every token passes through an MLP (multilayer perceptron, also called the feed-forward network) on its own.',
			'It stretches the 768 numbers out to 3,072, lets them through a curved gate called GELU, and squeezes them back to 768. Research suggests that much of what a model has learned about the world is stored in these layers.'
		],
		takeaway: 'Attention mixes words together; the MLP then works on each word by itself.',
		visual: 'mlp',
		highlight: ['mlp'],
		spot: ['mlp', 'mlpUp', 'mlpDown']
	},
	{
		id: 'residual',
		short: 'Residual + norm',
		title: 'Residual connections and layer norm',
		body: [
			'Two helpers keep the numbers healthy. A residual connection adds each part’s input back onto its output, so nothing important gets lost and very deep stacks can still be trained.',
			'Layer normalization rescales each token’s 768 numbers to a steady range. GPT-2 applies it before attention, before the MLP and once more at the very end.'
		],
		takeaway: 'Add the input back, keep the scale steady: that is what lets models grow deep.',
		visual: 'residual',
		highlight: ['residual', 'layer-normalization'],
		spot: []
	},
	{
		id: 'stack',
		short: 'Stacking',
		title: 'Stack the block twelve times',
		body: [
			'Attention plus the MLP (with their helpers) form one transformer block. GPT-2 small stacks 12 of them, each with its own learned weights.',
			'Every block refines the token lists a little more. Early blocks tend to capture simple patterns; later ones build up richer meaning. Bigger models simply stack more, wider blocks.'
		],
		takeaway: 'Same recipe, repeated: 12 blocks deep in GPT-2 small, many more in larger models.',
		visual: 'stack',
		highlight: ['blocks'],
		spot: []
	},
	{
		id: 'next-word',
		short: 'Next word',
		title: 'Scoring every possible next word',
		body: [
			'After the last block, the last token’s list is compared with all 50,257 tokens. That gives one score (a logit) for each possible next token.',
			'Softmax turns the scores into chances that add up to 100%. Temperature, top-k and top-p then shape how the next word is drawn. Add it to the text and repeat: that is how a chatbot writes, one token at a time.'
		],
		takeaway: 'A language model is a next-word guesser, run again and again.',
		visual: 'race',
		highlight: ['output-logit', 'output-probabilities'],
		spot: ['transformer-blocks', 'softmax']
	}
];
