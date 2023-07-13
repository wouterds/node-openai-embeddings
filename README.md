# @wouterds/node-openai-embeddings

[![code-review](https://github.com/wouterds/node-openai-embeddings/workflows/code-review/badge.svg)](https://github.com/wouterds/node-openai-embeddings/actions/workflows/code-review.yml)

## Setup

```bash
# install dependencies
yarn

# copy .env.example to .env and fill in the required values
cp .env.example .env
```

## Usage

```bash
# index data from a csv
yarn cli:generate-db --csv ./path/to/data.csv --field description

# query db with openai
yarn cli:query --prompt "A question of which the answer can be found in indexed data"
```
