<script>
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import Katex from '~/utils/Katex.svelte';
</script>

<div id="description">
	<div class="article-section" data-click="article-intro">
		<h1>What is a Transformer?</h1>

		<p>
			Transformer is a neural network architecture that has fundamentally changed the approach to
			Artificial Intelligence. Transformer was first introduced in the seminal paper
			<a
				href="https://dl.acm.org/doi/10.5555/3295222.3295349"
				title="ACM Digital Library"
				target="_blank">"Attention is All You Need"</a
			>
			in 2017 and has since become the go-to architecture for deep learning models, powering text-generative
			models like OpenAI's <strong>GPT</strong>, Meta's <strong>Llama</strong>, and Google's
			<strong>Gemini</strong>. Beyond text, Transformer is also applied in
			<a
				href="https://huggingface.co/learn/audio-course/en/chapter3/introduction"
				title="Hugging Face"
				target="_blank">audio generation</a
			>,
			<a
				href="https://huggingface.co/learn/computer-vision-course/unit3/vision-transformers/vision-transformers-for-image-classification"
				title="Hugging Face"
				target="_blank">image recognition</a
			>,
			<a href="https://elifesciences.org/articles/82819" title="eLife"
				>protein structure prediction</a
			>, and even
			<a
				href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/"
				title="Deep Learning AI"
				target="_blank">game playing</a
			>, demonstrating its versatility across numerous domains.
		</p>
		<p>
			Fundamentally, text-generative Transformer models operate on the principle of <strong
				>next-token prediction</strong
			>: given a text prompt from the user, what is the
			<em>most probable next token (a word or part of a word)</em> that will follow this input? The core
			innovation and power of Transformers lie in their use of self-attention mechanism, which allows
			them to process entire sequences and capture long-range dependencies more effectively than previous
			architectures.
		</p>
		<p>
			GPT-2 family of models are prominent examples of text-generative Transformers. Transformer
			Playground is powered by the
			<a href="https://huggingface.co/openai-community/gpt2" title="Hugging Face" target="_blank"
				>GPT-2</a
			>
			(small) model which has 124 million parameters. While it is not the latest or most powerful Transformer
			model, it shares many of the same architectural components and principles found in the current
			state-of-the-art models making it an ideal starting point for understanding the basics.
		</p>
	</div>

	<div class="article-section" data-click="article-overview">
		<h1>Transformer Architecture</h1>

		<p>
			Every text-generative Transformer consists of these <strong>three key components</strong>:
		</p>
		<ol>
			<li>
				<strong class="bold-purple">Embedding</strong>: Text input is divided into smaller units
				called tokens, which can be words or subwords. These tokens are converted into numerical
				vectors called embeddings, which capture the semantic meaning of words.
			</li>
			<li>
				<strong class="bold-purple">Transformer Block</strong> is the fundamental building block of
				the model that processes and transforms the input data. Each block includes:
				<ul class="">
					<li>
						<strong>Attention Mechanism</strong>, the core component of the Transformer block. It
						allows tokens to communicate with other tokens, capturing contextual information and
						relationships between words.
					</li>
					<li>
						<strong>MLP (Multilayer Perceptron) Layer</strong>, a feed-forward network that operates
						on each token independently. While the goal of the attention layer is to route
						information between tokens, the goal of the MLP is to refine each token's
						representation.
					</li>
				</ul>
			</li>
			<li>
				<strong class="bold-purple">Output Probabilities</strong>: The final linear and softmax
				layers transform the processed embeddings into probabilities, enabling the model to make
				predictions about the next token in a sequence.
			</li>
		</ol>
	</div>

	<div class="article-section" id="paper-2017" data-click="article-paper-2017">
		<h2>From the 2017 Paper to GPT-2</h2>
		<p>
			The Transformer was introduced in the 2017 paper
			<a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener"
				>“Attention Is All You Need”</a
			>
			by eight researchers, most of them at Google. The original model was built for
			<strong>translation</strong> (for example, English to German) and had two halves: an
			<strong>encoder</strong> that reads the whole input sentence, and a <strong>decoder</strong>
			that writes the translation one token at a time, looking back at the encoder's output through cross-attention.
		</p>
		<p>
			GPT-2 (2019) keeps <strong>only the decoder</strong>. There is no second sentence to read, so
			there is no cross-attention: each block has masked self-attention and an MLP, and the model
			simply predicts the next token of the text it is given. The core ideas you see in this
			playground come straight from the paper: scaled dot-product attention, multiple heads, the
			output projection W<sub>O</sub>, residual connections and layer normalization.
		</p>
		<table class="paper-table">
			<thead>
				<tr><th></th><th>2017 Transformer (base)</th><th>GPT-2 (small)</th></tr>
			</thead>
			<tbody>
				<tr><td>Job</td><td>Translation</td><td>Continue text (next-token prediction)</td></tr>
				<tr><td>Parts</td><td>Encoder + decoder</td><td>Decoder only</td></tr>
				<tr><td>Layers</td><td>N = 6 encoder + 6 decoder</td><td>12 blocks</td></tr>
				<tr><td>Vector size (d<sub>model</sub>)</td><td>512</td><td>768</td></tr>
				<tr><td>Attention heads</td><td>8 (64 numbers each)</td><td>12 (64 numbers each)</td></tr>
				<tr><td>MLP hidden size</td><td>2,048</td><td>3,072</td></tr>
				<tr
					><td>Word positions</td><td>Fixed sine and cosine waves</td><td
						>Learned position embeddings</td
					></tr
				>
				<tr
					><td>Layer normalization</td><td>After each part</td><td
						>Before each part (and once at the end)</td
					></tr
				>
			</tbody>
		</table>
	</div>

	<div class="article-section" id="embedding" data-click="article-embedding">
		<h2>Embedding</h2>
		<p>
			Let's say you want to generate text using a Transformer model. You add the prompt like this
			one: <code>“Data visualization empowers users to”</code>. This input needs to be converted
			into a format that the model can understand and process. That is where embedding comes in: it
			transforms the text into a numerical representation that the model can work with. To convert a
			prompt into embedding, we need to 1) tokenize the input, 2) obtain token embeddings, 3) add
			positional information, and finally 4) add up token and position encodings to get the final
			embedding. Let’s see how each of these steps is done.
		</p>
		<div class="figure">
			<img src="./article_assets/embedding.png" width="65%" />
		</div>
		<div class="figure-caption">
			Figure <span class="attention">1</span>. Expanding the Embedding layer view, showing how the
			input prompt is converted to a vector representation. The process involves
			<span class="fig-numbering">(1)</span> Tokenization, (2) Token Embedding, (3) Positional Encoding,
			and (4) Final Embedding.
		</div>
		<div class="article-subsection">
			<h3>Step 1: Tokenization</h3>
			<p>
				Tokenization is the process of breaking down the input text into smaller, more manageable
				pieces called tokens. These tokens can be a word or a subword. The words <code>"Data"</code>
				and <code>"visualization"</code> correspond to unique tokens, while the word
				<code>"empowers"</code>
				is split into two tokens. The full vocabulary of tokens is decided before training the model:
				GPT-2's vocabulary has <code>50,257</code> unique tokens. Now that we split our input text into
				tokens with distinct IDs, we can obtain their vector representation from embeddings.
			</p>
		</div>
		<div class="article-subsection" id="article-token-embedding">
			<h3>Step 2. Token Embedding</h3>
			<p>
				GPT-2 (small) represents each token in the vocabulary as a 768-dimensional vector; the
				dimension of the vector depends on the model. These embedding vectors are stored in a matrix
				of shape <code>(50,257, 768)</code>, containing approximately 39 million parameters! This
				extensive matrix allows the model to assign semantic meaning to each token, in the sense
				that tokens with similar usage or meaning in language are placed close together in this
				high-dimensional space, while dissimilar tokens are farther apart.
			</p>
		</div>
		<div class="article-subsection" id="article-positional-embedding">
			<h3>Step 3. Positional Encoding</h3>
			<p>
				The Embedding layer also encodes information about each token's position in the input
				prompt. Different models use various methods for positional encoding. GPT-2 trains its own
				positional encoding matrix from scratch, integrating it directly into the training process.
			</p>

			<!-- <div class="article-subsection-l2">
	<h4>Alternative Positional Encoding Approach <strong class='attention'>[POTENTIALLY COLLAPSIBLE]</strong></h4>
	<p>
	  Other models, like the original Transformer and BERT,
	  use sinusoidal functions for positional encoding.

	  This sinusoidal encoding is deterministic and designed to reflect
	  the absolute as well as the relative position of each token.
	</p>
	<p>
	  Each position in a sequence is assigned a unique mathematical
	  representation using a combination of sine and cosine functions.

	  For a given position, the sine function represents even dimensions,
	  and the cosine function represents odd dimensions within the positional encoding vector.

	  This periodic nature ensures that each position has a consistent encoding,
	  independent of the surrounding context.
	</p>

	<p>
	  Here’s how it works:
	</p>

	<span class='attention'>
	  SINUSOIDAL POSITIONAL ENCODING EQUATION
	</span>

	<ul>
	  <li>
		<strong>Sine Function</strong>: Used for even indices of the embedding vector.
	  </li>
	  <li>
		<strong>Cosine Function</strong>: Used for odd indices of the embedding vector.
	</ul>

	<p>
	  Hover over individual encoding values in the matrix above to
	  see how it's calculated using the sins and cosine functions.
	</p>
  </div> -->
		</div>
		<div class="article-subsection">
			<h3>Step 4. Final Embedding</h3>
			<p>
				Finally, we sum the token and positional encodings to get the final embedding
				representation. This combined representation captures both the semantic meaning of the
				tokens and their position in the input sequence.
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-transformer-block">
		<h2>Transformer Block</h2>

		<p>
			The core of the Transformer's processing lies in the Transformer block, which comprises
			multi-head self-attention and a Multi-Layer Perceptron layer. Most models consist of multiple
			such blocks that are stacked sequentially one after the other. The token representations
			evolve through layers, from the first block to the last one, allowing the model to build up an
			intricate understanding of each token. This layered approach leads to higher-order
			representations of the input. The GPT-2 (small) model we are examining consists of <code
				>12</code
			> such blocks.
		</p>
	</div>

	<div class="article-section" id="self-attention" data-click="article-attention">
		<h3>Multi-Head Self-Attention</h3>
		<p>
			The self-attention mechanism enables the model to capture relationships among tokens in a
			sequence, so that each token’s representation is influenced by the others. Multiple attention
			heads allow the model to consider these relationships from different perspectives; for
			example, one head may capture short-range syntactic links while another tracks broader
			semantic context. In the following section, we will walk through how multi-head self-attention
			is computed step by step.
		</p>
		<div class="article-subsection-l2">
			<h4>Step 1: Query, Key, and Value Matrices</h4>

			<div class="figure pt-10">
				<img src="./article_assets/QKV.png" width="80%" />
				<div class="text-xs">
					<Katex
						displayMode
						math={`
		QKV_{ij} = ( \\sum_{d=1}^{768} \\text{Embedding}_{i,d} \\cdot \\text{Weights}_{d,j}) + \\text{Bias}_j
		`}
					/>
				</div>
			</div>
			<div class="figure-caption">
				Figure <span class="attention">2</span>. Computing Query, Key, and Value matrices from the
				original embedding.
			</div>

			<p>
				Each token's embedding vector is transformed into three vectors:
				<span class="q-color">Query (Q)</span>,
				<span class="k-color">Key (K)</span>, and
				<span class="v-color">Value (V)</span>. These vectors are derived by multiplying the input
				embedding matrix with learned weight matrices for
				<span class="q-color">Q</span>,
				<span class="k-color">K</span>, and
				<span class="v-color">V</span>. Here's a web search analogy to help us build some intuition
				behind these matrices:
			</p>
			<ul>
				<li>
					<strong class="q-color font-medium">Query (Q)</strong> is the search text you type in the
					search engine bar. This is the token you want to
					<em>"find more information about"</em>.
				</li>
				<li>
					<strong class="k-color font-medium">Key (K)</strong> is the title of each web page in the search
					result window. It represents the possible tokens the query can attend to.
				</li>
				<li>
					<strong class="v-color font-medium">Value (V)</strong> is the actual content of web pages shown.
					Once we matched the appropriate search term (Query) with the relevant results (Key), we want
					to get the content (Value) of the most relevant pages.
				</li>
			</ul>
			<p>
				By using these QKV values, the model can calculate attention scores, which determine how
				much focus each token should receive when generating predictions.
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>Step 2: Multi-Head Splitting</h4>
			<p>
				<span class="q-color">Query</span>, <span class="k-color">key</span>, and
				<span class="v-color">Value</span>
				vectors are split into multiple heads—in GPT-2 (small)'s case, into
				<code>12</code> heads. Each head processes a segment of the embeddings independently, capturing
				different syntactic and semantic relationships. This design facilitates parallel learning of
				diverse linguistic features, enhancing the model's representational power.
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>Step 3: Masked Self-Attention</h4>
			<p>
				In each head, we perform masked self-attention calculations. This mechanism allows the model
				to generate sequences by focusing on relevant parts of the input while preventing access to
				future tokens.
			</p>

			<div class="figure">
				<img src="./article_assets/attention.png" width="80%" align="middle" />
			</div>
			<div class="figure-caption">
				Figure <span class="attention">3</span>. Using Query, Key, and Value matrices to calculate
				masked self-attention.
			</div>

			<ul>
				<li>
					<strong>Dot Product</strong>: The dot product of
					<span class="q-color">Query</span>
					and <span class="k-color">Key</span> matrices determines the
					<strong>attention score</strong>, producing a square matrix that reflects the relationship
					between all input tokens.
				</li>
				<li>
					<strong>Scaling · Mask</strong>: The attention scores are scaled and a mask is applied to
					the upper triangle of the attention matrix to prevent the model from accessing future
					tokens, setting these values to negative infinity. The model needs to learn how to predict
					the next token without “peeking” into the future.
				</li>
				<li>
					<strong>Softmax · Dropout</strong>: After masking and scaling, the attention scores are
					converted into probabilities by the softmax operation, then optionally regularized with
					dropout. Each row of the matrix sums to one and indicates the relevance of every other
					token to the left of it.
				</li>
			</ul>
		</div>
		<div class="article-subsection-l2">
			<h4>Step 4: Output and Concatenation</h4>
			<p>
				The model uses the masked self-attention scores and multiplies them with the
				<span class="v-color">Value</span> matrix to get the
				<span class="purple-color">final output</span>
				of the self-attention mechanism. GPT-2 has <code>12</code> self-attention heads, each capturing
				different relationships between tokens. The outputs of these heads are concatenated (12 × 64
				= 768 numbers per token) and passed through a linear projection.
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>Step 5: Output Projection (W<sub>O</sub>)</h4>
			<p>
				The concatenated vector is multiplied by one more learned matrix, the
				<strong>output projection W<sub>O</sub></strong> (768 × 768, plus a bias; called
				<code>c_proj</code> in the GPT-2 code). Concatenation only places the heads side by side; W<sub
					>O</sub
				>
				mixes what the different heads found into one vector for each token. This is the
				<em>W<sup>O</sup></em> in the 2017 paper's formula MultiHead(Q, K, V) = Concat(head<sub
					>1</sub
				>, …, head<sub>h</sub>) W<sup>O</sup>. Click the <strong>× W<sub>O</sub></strong> badge in the
				visualization to see it. The result then goes through dropout and is added back to the input
				by the residual connection.
			</p>
		</div>
	</div>

	<div class="article-section" id="article-activation" data-click="article-mlp">
		<h3>MLP: Multilayer Perceptron (the Feed-Forward Network)</h3>

		<div class="figure">
			<img src="./article_assets/mlp.png" width="70%" align="middle" />
		</div>
		<div class="figure-caption">
			Figure <span class="attention">4</span>. Using MLP layer to project the self-attention
			representations into higher dimensions to enhance the model's representational capacity.
		</div>

		<p>
			After the multiple heads of self-attention capture the diverse relationships between the input
			tokens, the projected attention outputs are passed through the multilayer perceptron (MLP),
			also called the feed-forward network, to enhance the model's representational capacity. The
			MLP block consists of two linear transformations with a <a
				href="https://en.wikipedia.org/wiki/Rectified_linear_unit#Gaussian-error_linear_unit_(GELU)"
				>GELU</a
			> activation function in between.
		</p>
		<p>
			The first linear transformation expands the dimensionality of the input four-fold from <code
				>768</code
			>
			to
			<code>3072</code>. This expansion step allows the model to project the token representations
			into a higher-dimensional space, where it can capture richer and more complex patterns that
			may not be visible in the original dimension.
		</p>
		<p>
			The second linear transformation then reduces the dimensionality back to the original size of <code
				>768</code
			>.This compression step brings the representations back to a manageable size while retaining
			the useful nonlinear transformations introduced in the expansion step.
		</p>
		<p>
			Unlike the self-attention mechanism, which integrates information across tokens, the MLP
			processes tokens independently and simply maps each token representation from one space to
			another, enriching the overall model capacity.
		</p>
	</div>

	<div class="article-section" id="article-prob" data-click="article-prob">
		<h2>Output Probabilities</h2>
		<p>
			After the input has been processed through all Transformer blocks, the output is passed
			through the final linear layer to prepare it for token prediction. This layer projects the
			final representations into a <code>50,257</code>
			dimensional space, where every token in the vocabulary has a corresponding value called
			<code>logit</code>. Any token can be the next word, so this process allows us to simply rank
			these tokens by their likelihood of being that next word. We then apply the softmax function
			to convert the logits into a probability distribution that sums to one. This will allow us to
			sample the next token based on its likelihood.
		</p>

		<div class="figure py-5">
			<img src="./article_assets/softmax.png" width="70%" />
		</div>
		<div class="figure-caption">
			Figure <span class="attention">5</span>. Each token in the vocabulary is assigned a
			probability based on the model's output logits. These probabilities determine the likelihood
			of each token being the next word in the sequence.
		</div>

		<p id="article-temperature" data-click="article-temperature">
			The final step is to generate the next token by sampling from this distribution The <code
				>temperature</code
			>
			hyperparameter plays a critical role in this process. Mathematically speaking, it is a very simple
			operation: model output logits are simply divided by the
			<code>temperature</code>:
		</p>

		<ul>
			<li>
				<code>temperature = 1</code>: Dividing logits by one has no effect on the softmax outputs.
			</li>
			<li>
				<code>temperature &lt; 1</code>: Lower temperature makes the model more confident and
				deterministic by sharpening the probability distribution, leading to more predictable
				outputs.
			</li>
			<li>
				<code>temperature &gt; 1</code>: Higher temperature creates a softer probability
				distribution, allowing for more randomness in the generated text – what some refer to as
				model <em>“creativity”</em>.
			</li>
		</ul>

		<p id="article-sampling" data-click="article-sampling">
			In addition, the sampling process can be further refined using <code>top-k</code>
			and
			<code>top-p</code> parameters:
		</p>
		<ul>
			<li>
				<code>top-k sampling</code>: Limits the candidate tokens to the top k tokens with the
				highest probabilities, filtering out less likely options.
			</li>
			<li>
				<code>top-p sampling</code>: Considers the smallest set of tokens whose cumulative
				probability exceeds a threshold p, ensuring that only the most likely tokens contribute
				while still allowing for diversity.
			</li>
		</ul>
		<p>
			By tuning <code>temperature</code>, <code>top-k</code>, and <code>top-p</code>, you can
			balance between deterministic and diverse outputs, tailoring the model's behavior to your
			specific needs.
		</p>
	</div>

	<div class="article-section" data-click="article-advanced-features">
		<h2>Auxiliary Architectural Features</h2>

		<p>
			There are several auxiliary architectural features that enhance the performance of Transformer
			models. While important for the model's overall performance, they are not as important for
			understanding the core concepts of the architecture. Layer Normalization, Dropout, and
			Residual Connections are crucial components in Transformer models, particularly during the
			training phase. Layer Normalization stabilizes training and helps the model converge faster.
			Dropout prevents overfitting by randomly deactivating neurons. Residual Connections allows
			gradients to flow directly through the network and helps to prevent the vanishing gradient
			problem.
		</p>
		<div class="article-subsection" id="article-ln">
			<h3>Layer Normalization</h3>

			<p>
				Layer Normalization helps to stabilize the training process and improves convergence. It
				works by normalizing the inputs across the features, ensuring that the mean and variance of
				the activations are consistent. This normalization helps mitigate issues related to internal
				covariate shift, allowing the model to learn more effectively and reducing the sensitivity
				to the initial weights. Layer Normalization is applied twice in each Transformer block, once
				before the self-attention mechanism and once before the MLP layer.
			</p>
		</div>
		<div class="article-subsection" id="article-dropout">
			<h3>Dropout</h3>

			<p>
				Dropout is a regularization technique used to prevent overfitting in neural networks by
				randomly setting a fraction of model weights to zero during training. This encourages the
				model to learn more robust features and reduces dependency on specific neurons, helping the
				network generalize better to new, unseen data. During model inference, dropout is
				deactivated. This essentially means that we are using an ensemble of the trained
				subnetworks, which leads to a better model performance.
			</p>
		</div>
		<div class="article-subsection" id="article-residual">
			<h3>Residual Connections</h3>

			<p>
				Residual connections were first introduced in the ResNet model in 2015. This architectural
				innovation revolutionized deep learning by enabling the training of very deep neural
				networks. Essentially, residual connections are shortcuts that bypass one or more layers,
				adding the input of a layer to its output. This helps mitigate the vanishing gradient
				problem, making it easier to train deep networks with multiple Transformer blocks stacked on
				top of each other. In GPT-2, residual connections are used twice within each Transformer
				block: once before the MLP and once after, ensuring that gradients flow more easily, and
				earlier layers receive sufficient updates during backpropagation.
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-interactive-features">
		<h1>Interactive Features</h1>
		<p>
			Transformer Playground is built to be interactive and allows you to explore the inner workings
			of the Transformer. Here are some of the interactive features you can play with:
		</p>

		<ul>
			<li>
				<strong>Input your own text sequence</strong> to see how the model processes it and predicts
				the next word. Explore attention weights, intermediate computations, and see how the final output
				probabilities are calculated.
			</li>
			<li>
				<strong>Use temperature slider</strong> to control the randomness of the model’s predictions.
				Explore how you can make the model output more deterministic or more creative by changing the
				temperature value.
			</li>
			<li>
				<strong>Select top-k and top-p sampling methods</strong> to adjust sampling behavior during inference.
				Experiment with different values and see how the probability distribution changes and influences
				the model's predictions.
			</li>
			<li>
				<strong>Interact with attention maps</strong> to see how the model focuses on different tokens
				in the input sequence. Hover over tokens to highlight their attention weights and explore how
				the model captures context and relationships between words.
			</li>
		</ul>
	</div>

	<div class="article-section" data-click="article-video">
		<h2>Video Tutorials</h2>
		<p>
			Learn transformers step by step, explained simply, on the
			<a href="https://www.youtube.com/@hereandnow_ai" target="_blank" rel="noopener"
				>HERE AND NOW AI YouTube channel</a
			>.
		</p>
		<p>
			Watch the
			<a href="https://www.youtube.com/watch?v=ECR4oAwocjs" target="_blank" rel="noopener"
				>original video tutorial</a
			> by the Transformer Explainer team on YouTube. (We link to videos instead of embedding them, so
			this page loads nothing from YouTube unless you click.)
		</p>
	</div>
	<div class="article-section" data-click="article-implementation">
		<h2>How is Transformer Playground Implemented?</h2>
		<p>
			Transformer Playground features a live GPT-2 (small) model running directly in the browser.
			This model is derived from the PyTorch implementation of GPT by Andrej Karpathy's
			<a href="https://github.com/karpathy/nanoGPT" title="Github" target="_blank"
				>nanoGPT project</a
			>
			and has been converted to
			<a href="https://onnxruntime.ai/" title="ONNX" target="_blank">ONNX Runtime</a>
			for seamless in-browser execution. The interface is built using JavaScript, with
			<a href="https://kit.svelte.dev/" title="Svelte" target="_blank">Svelte</a>
			as a front-end framework and
			<a href="https://d3js.org/" title="D3" target="_blank">D3.js</a>
			for creating dynamic visualizations. Numerical values are updated live following the user input.
		</p>
	</div>

	<div class="article-section" id="credits" data-click="article-credit">
		<h2>Credits</h2>
		<p>
			<strong
				>Based on
				<a href="https://github.com/poloclub/transformer-explainer" target="_blank" rel="noopener"
					>Transformer Explainer</a
				>
				by the Polo Club of Data Science, Georgia Tech (MIT licence).</strong
			>
			Transformer Explainer was created by
			<a href="https://aereeeee.github.io/" target="_blank">Aeree Cho</a>,
			<a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank">Grace C. Kim</a>,
			<a href="https://alexkarpekov.com/" target="_blank">Alexander Karpekov</a>,
			<a href="https://alechelbling.com/" target="_blank">Alec Helbling</a>,
			<a href="https://zijie.wang/" target="_blank">Jay Wang</a>,
			<a href="https://seongmin.xyz/" target="_blank">Seongmin Lee</a>,
			<a href="https://bhoov.com/" target="_blank">Benjamin Hoover</a>, and
			<a href="https://poloclub.github.io/polochau/" target="_blank">Polo Chau</a>
			at the Georgia Institute of Technology. Read their paper:
			<a href="https://doi.org/10.1145/3772318.3791725" target="_blank" rel="noopener"
				>Transformer Explainer (CHI 2026), DOI 10.1145/3772318.3791725</a
			>.
		</p>
		<p>
			The model is
			<a href="https://github.com/openai/gpt-2" target="_blank" rel="noopener"
				>GPT-2 (small) by OpenAI</a
			>
			(modified MIT licence), loaded through Andrej Karpathy's
			<a href="https://github.com/karpathy/nanoGPT" target="_blank" rel="noopener">nanoGPT</a>, and
			text is split into tokens with the
			<a href="https://github.com/xenova/transformers.js" target="_blank" rel="noopener"
				>Transformers.js</a
			>
			GPT-2 tokenizer by Xenova. The dark theme started from a community contribution to the original
			project.
		</p>
		<p>
			<strong>Transformer Playground</strong> is built and maintained by HERE AND NOW AI. It adds a
			new light and dark design, Story mode (a guided 9-step tour), an attention heatmap, the
			next-word race, shareable links, keyboard shortcuts, a phone layout, the attention output
			projection (W<sub>O</sub>) and a link to the 2017 paper, and it removes all analytics and
			tracking. The source code is open under the MIT licence:
			<a
				href="https://github.com/hereandnowai/transformer-playground"
				target="_blank"
				rel="noopener">github.com/hereandnowai/transformer-playground</a
			>.
		</p>
	</div>
	<div class="article-section about-hnai" id="about" data-click="article-about">
		<h2>About HERE AND NOW AI</h2>
		<p>
			HERE AND NOW AI teaches artificial intelligence, generative AI and agentic AI, explained
			simply for everyone. <em>AI is Good.</em>
		</p>
		<ul class="contact">
			<li>
				Website: <a href="https://hereandnowai.com" target="_blank" rel="noopener"
					>hereandnowai.com</a
				>
			</li>
			<li>Email: <a href="mailto:info@hereandnowai.com">info@hereandnowai.com</a></li>
			<li>
				YouTube: <a href="https://www.youtube.com/@hereandnow_ai" target="_blank" rel="noopener"
					>@hereandnow_ai</a
				>
			</li>
			<li>
				GitHub: <a href="https://github.com/hereandnowai" target="_blank" rel="noopener"
					>github.com/hereandnowai</a
				>
			</li>
		</ul>
	</div>
</div>

<style lang="scss">
	a {
		color: var(--link);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--link) 35%, transparent);
		text-underline-offset: 3px;

		&:hover {
			text-decoration-color: currentColor;
		}
	}

	:global(html.dark) #description h1,
	:global(html.dark) #description h2 {
		border-left: 4px solid var(--brand);
		padding-left: 0.75rem;
	}
	.paper-table {
		width: 100%;
		margin-top: 1rem;
		border-collapse: collapse;
		font-size: 0.95rem;
		th,
		td {
			text-align: left;
			padding: 0.4rem 0.6rem;
			border-bottom: 1px solid var(--line);
			vertical-align: top;
		}
		th {
			font-weight: 600;
			color: var(--ink-strong);
			border-bottom: 2px solid var(--line-strong);
		}
		td:first-child {
			color: var(--ink-muted);
			white-space: nowrap;
		}
	}
	:global(html.dark) .paper-table th {
		border-bottom-color: var(--brand);
	}
	.bold-purple {
		color: var(--accent-purple-700);
		font-weight: bold;
	}

	code {
		color: var(--ink-muted);
		background-color: var(--surface-subtle);
		font-family: theme('fontFamily.mono');
	}

	.q-color {
		color: theme('colors.blue.400');
	}

	.k-color {
		color: theme('colors.red.400');
	}

	.v-color {
		color: theme('colors.green.400');
	}

	.purple-color {
		color: var(--accent-purple-500);
	}

	.article-section {
		padding-bottom: 2rem;
	}
	.architecture-section {
		padding-top: 1rem;
	}
	#description {
		padding-bottom: 3rem;
		margin-left: auto;
		margin-right: auto;
		max-width: 78ch;
	}

	#description h1 {
		color: var(--heading);
		font-size: 2.2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h2 {
		color: var(--heading);
		font-size: 2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h3 {
		color: var(--ink-body);
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description h4 {
		color: var(--ink-body);
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description p {
		margin: 1rem 0;
	}

	#description p img {
		vertical-align: middle;
	}

	#description .figure-caption {
		font-size: 0.8rem;
		margin-top: 0.5rem;
		text-align: center;
		margin-bottom: 2rem;
	}

	#description ol {
		margin-left: 3rem;
		list-style-type: decimal;
	}

	#description li {
		margin: 0.6rem 0;
	}

	#description p,
	#description div,
	#description li {
		color: var(--ink-secondary);
		line-height: 1.6;
	}

	#description small {
		font-size: 0.8rem;
	}

	#description ol li img {
		vertical-align: middle;
	}

	#description .video-link {
		color: var(--link);
		cursor: pointer;
		font-weight: normal;
		text-decoration: none;
	}

	#description ul {
		list-style-type: disc;
		margin-left: 2.5rem;
		margin-bottom: 1rem;
	}

	#description a:hover,
	#description .video-link:hover {
		text-decoration: underline;
	}

	.figure,
	.video {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
