function RepositoryImageViewModel(id, name, tags, created, size, v1digest, v2digest, fsLayers, history, signatures, manifestV2) {
  this.Id = id;
  this.Name = name;
  this.Tags = tags;
  this.Created = created;
  this.Size = size;
  this.V1Digest = v1digest;
  this.V2Digest = v2digest;
  this.FsLayers = fsLayers;
  this.History = history;
  this.Signatures = signatures;
  this.ManifestV2 = manifestV2;
}