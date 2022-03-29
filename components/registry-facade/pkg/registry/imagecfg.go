// Copyright (c) 2020 Gitpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package registry

import (
	"context"

	lru "github.com/hashicorp/golang-lru"
	ociv1 "github.com/opencontainers/image-spec/specs-go/v1"
	"golang.org/x/xerrors"
	"google.golang.org/grpc"

	"github.com/gitpod-io/gitpod/registry-facade/api"
)

// ErrRefInvalid is returned by spec provider who cannot interpret the ref
var ErrRefInvalid = xerrors.Errorf("invalid ref")

// ImageSpecProvider provide the image spec for an image pull
// based on the ref
type ImageSpecProvider interface {
	// GetSpec returns the spec for the image or a wrapped ErrRefInvalid
	GetSpec(ctx context.Context, ref string) (*api.ImageSpec, error)
}

// RemoteSpecProvider queries a remote spec provider using gRPC
type RemoteSpecProvider struct {
	conn *grpc.ClientConn
}

// NewRemoteSpecProvider produces a new remote spec provider
func NewRemoteSpecProvider(addr string, opts []grpc.DialOption) (*RemoteSpecProvider, error) {
	conn, err := grpc.DialContext(context.Background(), addr, opts...)
	if err != nil {
		return nil, err
	}

	return &RemoteSpecProvider{
		conn: conn,
	}, nil
}

// GetSpec returns the spec for the image or a wrapped ErrRefInvalid
func (p *RemoteSpecProvider) GetSpec(ctx context.Context, ref string) (*api.ImageSpec, error) {
	client := api.NewSpecProviderClient(p.conn)

	resp, err := client.GetImageSpec(ctx, &api.GetImageSpecRequest{Id: ref})
	if err != nil {
		return nil, xerrors.Errorf("%w: %s", ErrRefInvalid, err.Error())
	}
	return resp.Spec, nil
}

// NewCachingSpecProvider creates a new LRU caching spec provider with a max number of specs it can cache.
func NewCachingSpecProvider(space int, delegate ImageSpecProvider) (*CachingSpecProvider, error) {
	cache, err := lru.New(space)
	if err != nil {
		return nil, err
	}

	return &CachingSpecProvider{
		Cache:    cache,
		Delegate: delegate,
	}, nil
}

// CachingSpecProvider caches an image spec in an LRU cache
type CachingSpecProvider struct {
	Cache    *lru.Cache
	Delegate ImageSpecProvider
}

// GetSpec returns the spec for the image or a wrapped ErrRefInvalid
func (p *CachingSpecProvider) GetSpec(ctx context.Context, ref string) (*api.ImageSpec, error) {
	res, ok := p.Cache.Get(ref)
	if ok {
		return res.(*api.ImageSpec), nil
	}
	spec, err := p.Delegate.GetSpec(ctx, ref)
	if err != nil {
		return nil, err
	}
	p.Cache.Add(ref, spec)
	return spec, nil
}

// ConfigModifier modifies an image's configuration
type ConfigModifier func(ctx context.Context, spec *api.ImageSpec, cfg *ociv1.Image) (layer []ociv1.Descriptor, err error)

// NewConfigModifierFromLayerSource produces a config modifier from a layer source
func NewConfigModifierFromLayerSource(src LayerSource) ConfigModifier {
	return func(ctx context.Context, spec *api.ImageSpec, cfg *ociv1.Image) (layer []ociv1.Descriptor, err error) {
		addons, err := src.GetLayer(ctx, spec)
		if err != nil {
			return
		}
		envs, err := src.Envs(ctx, spec)
		if err != nil {
			return
		}

		for _, l := range addons {
			layer = append(layer, l.Descriptor)
			cfg.RootFS.DiffIDs = append(cfg.RootFS.DiffIDs, l.DiffID)
		}

		if len(envs) > 0 {
			parsed := parseEnvs(cfg.Config.Env)
			for _, modifyEnv := range envs {
				modifyEnv(parsed)
			}
			cfg.Config.Env = parsed.serialize()
		}

		return
	}
}
