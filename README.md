# Transformer Playground by HERE AND NOW AI

**See how a GPT-2 transformer thinks, live in your browser.** Type a sentence and watch every step the model takes to
guess the next word: tokens, embeddings, Query/Key/Value, multi-head attention, the output projection W<sub>O</sub>,
the MLP (multilayer perceptron, the feed-forward network) and the final probabilities. Nothing to install, no account,
no tracking.

**Try it live: https://hereandnowai.github.io/transformer-playground/**

[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)
[![Paper: Attention Is All You Need](https://img.shields.io/badge/arXiv-1706.03762-red)](https://arxiv.org/abs/1706.03762)

Transformer Playground is a fork of [Transformer Explainer](https://github.com/poloclub/transformer-explainer) by the
Polo Club of Data Science at Georgia Tech, updated for 2026 by [HERE AND NOW AI](https://hereandnowai.com) for our
lessons on YouTube.

## What is new in this fork

- **The 2017 paper, connected.** A textbook card and an article section link the playground to
  [“Attention Is All You Need”](https://arxiv.org/abs/1706.03762): the original was an encoder-decoder for translation
  (N = 6, d<sub>model</sub> 512, 8 heads); GPT-2 keeps only the decoder.
- **The attention output projection W<sub>O</sub> is shown.** Click the **× W<sub>O</sub>** badge to see the 12 head
  outputs joined and multiplied by W<sub>O</sub> (768 × 768, `c_proj` in the GPT-2 code). (Upstream issue #71.)
- **MLP spelled out**: multilayer perceptron, the feed-forward network. (Upstream issue #89.)
- **Dark theme by default** in the HERE AND NOW AI colours; the light theme is one click away (the dark-mode token system
  comes from a community pull request to the original project, #90).
- **Privacy:** Google Tag Manager, Google Analytics and every user identifier removed. The page loads no fonts or videos
  from third parties; it only downloads the model (from this site), the ONNX Runtime WebAssembly files (jsDelivr CDN)
  and the tokenizer (Hugging Face).
- **`npm install` works again** (Vite 6 to match `@sveltejs/vite-plugin-svelte` 6; upstream issue #74, as in PR #85).

## Run it on your computer

You need [Node.js](https://nodejs.org/) 20 or newer (npm 10 or newer comes with it).

```bash
git clone https://github.com/hereandnowai/transformer-playground.git
cd transformer-playground
npm install
npm run dev
```

Then open http://localhost:5173 in your browser. The first visit downloads the GPT-2 model (about 630 MB, in 63 parts)
into your browser, so give it a minute. It runs on your CPU through WebAssembly; a desktop or laptop browser works best.

Other commands:

```bash
npm run build     # static site in ./build (served under /transformer-playground)
npm run preview   # preview the production build
npm run deploy    # publish ./build to the gh-pages branch (GitHub Pages)
```

## How it works

- **Model:** GPT-2 (small, 124 million parameters), exported to ONNX and run in the browser with
  [ONNX Runtime Web](https://onnxruntime.ai/) (`static/model-v2`). The model code follows Andrej Karpathy's
  [nanoGPT](https://github.com/karpathy/nanoGPT) (`src/utils/model`).
- **Tokenizer:** the GPT-2 tokenizer from [Transformers.js](https://github.com/xenova/transformers.js) (`Xenova/gpt2`).
- **Interface:** [SvelteKit](https://kit.svelte.dev/) with [D3.js](https://d3js.org/), [GSAP](https://gsap.com/),
  [KaTeX](https://katex.org/) and Tailwind CSS / Flowbite.

## Credits

- **Transformer Explainer** by Aeree Cho, Grace C. Kim, Alexander Karpekov, Seongmin Lee, Alec Helbling,
  Benjamin Hoover, Zijie J. Wang, Minsuk Kahng and Duen Horng (Polo) Chau, Polo Club of Data Science, Georgia Tech
  (MIT licence): https://github.com/poloclub/transformer-explainer.
  Paper: *Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentation*,
  CHI 2026, [DOI 10.1145/3772318.3791725](https://doi.org/10.1145/3772318.3791725).
- **GPT-2** by OpenAI, released under a [modified MIT licence](https://github.com/openai/gpt-2/blob/master/LICENSE).
- **nanoGPT** by Andrej Karpathy (MIT).
- **Transformers.js** and the `Xenova/gpt2` tokenizer by Joshua Lochner (Xenova) / Hugging Face (Apache-2.0).
- **Dark mode** token system: community pull request poloclub/transformer-explainer#90 (author kept in the git history).
- **Attention Is All You Need** (Vaswani et al., 2017): https://arxiv.org/abs/1706.03762.

If you use the visualization in research, please cite the original authors:

```bibtex
@inproceedings{cho2026transformer,
  title={Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentation},
  author={Cho, Aeree and Kim, Grace C and Karpekov, Alexander and Lee, Seongmin and Helbling, Alec and Hoover, Benjamin and Wang, Zijie J and Kahng, Minsuk and Chau, Duen Horng},
  booktitle={Proceedings of the 2026 CHI Conference on Human Factors in Computing Systems},
  pages={1--21},
  year={2026}
}
```

## About HERE AND NOW AI

HERE AND NOW AI teaches artificial intelligence, generative AI and agentic AI, explained simply for everyone.
*AI is Good.*

- Website: https://hereandnowai.com
- Email: info@hereandnowai.com
- YouTube: https://www.youtube.com/@hereandnow_ai
- GitHub: https://github.com/hereandnowai

Questions or ideas? [Open an issue](https://github.com/hereandnowai/transformer-playground/issues) or email us.

## Licence

MIT. See [LICENSE](LICENSE): the original copyright of the Polo Club of Data Science (2022) is kept, and HERE AND NOW AI
(2026) holds the copyright for the changes in this fork.
