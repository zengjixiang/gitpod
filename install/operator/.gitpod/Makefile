
.PHONY: setup-workspace
setup-workspace:
	./install-operator-sdk.sh
	GO111MODULE=on go get sigs.k8s.io/kustomize/kustomize/v4
	GO111MODULE=on go install sigs.k8s.io/kustomize/kustomize/v4@latest