# ==============================================================================
# Installation & Setup
# ==============================================================================

# Install dependencies using npm
install:
	npm ci

# ==============================================================================
# Playground Targets
# ==============================================================================

# Launch local dev playground
playground:
	@echo "==============================================================================="
	@echo "| Starting your agent playground...                                           |"
	@echo "|                                                                             |"
	@echo "| Try asking: What's the weather in San Francisco?                             |"
	@echo "==============================================================================="
	npm run build && npm run dev

# ==============================================================================
# Local Development Commands
# ==============================================================================

# Launch local development server
local-backend:
	npm run build && npx @google/adk-devtools api_server -h localhost --port 8000 dist/agent.js

# Run agent with CLI
run:
	npm run run

# ==============================================================================
# Backend Deployment Targets
# ==============================================================================

# Deploy to Cloud Run (Original method)
deploy-cloud-run:
	PROJECT_ID=$$(gcloud config get-value project) && \
	AGENT_VERSION=$$(node -e "console.log(require('./package.json').version)") && \
	gcloud beta run deploy fishermans-wharf-agent \
		--source . \
		--memory "4Gi" \
		--project $$PROJECT_ID \
		--region "us-central1" \
		--no-allow-unauthenticated \
		--no-cpu-throttling \
		--labels "created-by=adk" \
		--update-build-env-vars "AGENT_VERSION=$$AGENT_VERSION" \
		--update-env-vars \
		"COMMIT_SHA=$(shell git rev-parse HEAD),GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=$$PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1" \
		$(if $(IAP),--iap) \
		$(if $(PORT),--port=$(PORT))

# Deploy to Vertex AI Agent Engine (Recommended for production)
deploy:
	@echo "==============================================================================="
	@echo "| 🚀 Deploying to Vertex AI Agent Engine                                       |"
	@echo "==============================================================================="
	(uv export --default-index https://pypi.org/simple --no-hashes --no-header --no-dev --no-emit-project --no-annotate > app/app_utils/.requirements.txt 2>/dev/null || \
	uv export --default-index https://pypi.org/simple --no-hashes --no-header --no-dev --no-emit-project > app/app_utils/.requirements.txt) && \
	uv run --default-index https://pypi.org/simple -m app.app_utils.deploy \
		--source-packages=./app \
		--entrypoint-module=app.agent_engine_app \
		--entrypoint-object=agent_engine \
		--requirements-file=app/app_utils/.requirements.txt \
		$(if $(AGENT_IDENTITY),--agent-identity)

# Alias for backward compatibility
backend: deploy

# ==============================================================================
# Infrastructure Setup
# ==============================================================================

# Set up development environment resources using Terraform
setup-dev-env:
	PROJECT_ID=$$(gcloud config get-value project) && \
	(cd deployment/terraform/dev && terraform init && terraform apply --var-file vars/env.tfvars --var dev_project_id=$$PROJECT_ID --auto-approve)

# ==============================================================================
# Testing & Code Quality
# ==============================================================================

# Run unit and integration tests
test:
	npm run test

# Run load tests (requires local-backend running in another terminal)
load-test:
	npx tsx tests/load_test/load_test.ts

# Run code quality checks
lint:
	npm run lint

# ==============================================================================
# TypeScript-specific targets
# ==============================================================================

# Build TypeScript
build:
	npm run build

# Type checking only
typecheck:
	npm run typecheck

# Clean build artifacts
clean:
	rm -rf dist node_modules

# --- Commands from Agent Starter Pack ---

eval:
	@echo "==============================================================================="
	@echo "| Running Agent Evaluation                                                    |"
	@echo "==============================================================================="
	uv sync --dev --extra eval
	uv run adk eval ./app $${EVALSET:-tests/eval/evalsets/basic.evalset.json} \
		$(if $(EVAL_CONFIG),--config_file_path=$(EVAL_CONFIG),$(if $(wildcard tests/eval/eval_config.json),--config_file_path=tests/eval/eval_config.json,))

eval-all:
	@echo "==============================================================================="
	@echo "| Running All Evalsets                                                        |"
	@echo "==============================================================================="
	@for evalset in tests/eval/evalsets/*.evalset.json; do \
		echo ""; \
		echo "▶ Running: $$evalset"; \
		$(MAKE) eval EVALSET=$$evalset || exit 1; \
	done
	@echo ""
	@echo "✅ All evalsets completed"

register-gemini-enterprise:
	@uvx --index https://pypi.org/simple agent-starter-pack@0.38.0 register-gemini-enterprise

