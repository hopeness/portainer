angular.module('portainer.app')
  .controller('RegistryImageController', ['$q', '$scope', '$transition$', '$state', 'LocalRegistryService', 'RegistryService', 'LocalRegistryHelper', 'ModalService', 'Notifications',
    function ($q, $scope, $transition$, $state, LocalRegistryService, RegistryService, LocalRegistryHelper, ModalService, Notifications) {

      $scope.state = {
        actionInProgress: false
      };

      $scope.formValues = {
        Tag: ''
      };

      $scope.removeTags = function (selectedItems) {
        var promises = [];
        selectedItems.map(function (item) {
          promises.push(LocalRegistryService.deleteTag($scope.registryId, $scope.image.Name, item.V2Digest));
        });
        $q.all(promises).then(function success(data) {
            Notifications.success('Success', 'Tags successfully deleted');
            $state.reload();
          })
          .catch(function error(err) {
            Notifications.error('Failure', err, 'Unable to delete tags');
          });
      };

      $scope.addTag = function () {
        LocalRegistryService.addTag($scope.registryId, $scope.image.Name, $scope.formValues.Tag, $scope.image.ManifestV2)
          .then(function success(data) {
            Notifications.success('Success', 'Tag successfully added');
            $state.reload();
          })
          .catch(function error(err) {
            Notifications.error('Failure', err, 'Unable to add tag');
          });
      };

      $scope.retagAction = function (tag) {
        var manifest = LocalRegistryHelper.imageToManifest($scope.image);
        manifest.tag = tag.Value;
        LocalRegistryService.updateManifestTag($scope.registryId, $scope.image.Name, tag.NewValue, tag.Digest, $scope.image.ManifestV2)
          .then(function success(data) {
            Notifications.success('Tag successfully modified', 'New tag name: ' + tag.NewValue);
            $state.reload();
          })
          .catch(function error(err) {
            Notifications.error('Failure', err, 'Unable to modify tag');
            tag.Modified = false;
            tag.NewValue = tag.Value;
          });
      };

      $scope.removeImage = function () {
        ModalService.confirmDeletion(
          'This action will only remove the manifests linked to this image. You need to manually trigger a garbage collector pass on your registry to remove orphan layers and really remove the image content.',
          function onConfirm(confirmed) {
            if (!confirmed) {
              return;
            }
            LocalRegistryService.deleteTag($scope.registryId, $scope.image.Name, $scope.image.Tags[0].V2Digest)
              .then(function success(data) {
                Notifications.success('Success', 'Image sucessfully removed');
                $state.go('portainer.registries.registry.images', {id: $scope.registryId}, {reload: true});
              }).catch(function error(err) {
                Notifications.error('Failure', err, 'Unable to delete image');
              });
          }
        );
      };

      function initView() {
        var registryId = $scope.registryId = $transition$.params().id;
        var repositoryName = $transition$.params().repository;
        var imageId = $transition$.params().imageId;

        $q.all({
            registry: RegistryService.registry(registryId),
            image: LocalRegistryService.repositoryImage(registryId, repositoryName, imageId)
          })
          .then(function success(data) {
            $scope.registry = data.registry;
            $scope.image = data.image;
            console.log('image', data.image);
          })
          .catch(function error(err) {
            Notifications.error('Failure', err, 'Unable to retrieve image information');
          });
      }

      initView();
    }
  ]);