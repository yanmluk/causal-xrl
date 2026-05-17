# CausalXRL: Explainable Reinforcement Learning through Causal Graph Reasoning


CausalXRL explains reinforcement learning behavior with causal graph reasoning, supporting structure learning and local explanations for Gym-like and microRTS environments.


## Main Components

- `cxrl`: core CausalXRL library for gym-like environments, including rollout collection, causal graph inference, BART-based effect modeling, counterfactual reasoning utilities, and sample notebooks.
- `cxrl_microRTS`: microRTS-specific implementation with the required environment utilities and a browser-based dashboard for inspecting game states and context-aware causal models.

## Installation

Clone the repository and work from the repository root:

```bash
cd causal-xrl
```

Create a Python environment for the core library:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r cxrl/requirements.txt
```

The BART causal models use `rpy2` and the R package `dbarts`. 


## Core Library Usage

The easiest way to start is with the notebooks in `cxrl/jupyter/examples/`:

```bash
jupyter notebook cxrl/jupyter/examples/
```

Included examples:

- `CartPole.ipynb`
- `LunarLander.ipynb`
- `PongDuel.ipynb`

Evaluation notebooks are available in:

```bash
jupyter notebook cxrl/jupyter/eval/
```


## microRTS Dashboard

The `cxrl_microRTS` folder contains the microRTS-specific library and frontend dashboard.



Launch the dashboard with:

```bash
flask run
```


Note: some microRTS files and pretrained/data artifacts may be omitted from this public repository because of size or copyright restrictions. Please contact the authors for access to the full research artifact when needed.
