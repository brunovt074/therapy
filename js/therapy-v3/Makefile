.PHONY: install-hooks

install-hooks:
	git config core.hooksPath .githooks
	@echo ""
	@echo "Hooks installed. Now set the monorepo path (one-time per machine):"
	@echo "  git config therapy.monorepoPath /path/to/therapy"
	@echo ""
	@echo "After that, every 'git push origin master' will auto-sync the monorepo."
