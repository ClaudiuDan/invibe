from django.core.exceptions import FieldDoesNotExist, ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from inv_user.models import User
from chat.models import encode_image_field_to_base64
import base64
import random
from django.core.files.base import ContentFile
from django.db.models import Q

from .models import UserProfile, AlbumImage

from rest_framework import status
from rest_framework.response import Response

import json


def user_profile_to_dictionary_object(user_profile):
    response = {
        "userId": user_profile.pk,
        "name": user_profile.name,
        "short_description": user_profile.short_description,
        "long_description": user_profile.long_description,
        "gender": user_profile.gender,
        "longitude": user_profile.longitude,
        "latitude": user_profile.latitude,
    }

    if user_profile.profile_image:
        response["profile_image"] = encode_image_field_to_base64(user_profile.profile_image)
        response["profile_image_extension"] = user_profile.profile_image_extension

    return response


class DiscoverUserProfilesApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # This is a simplified version of the discover profiles API

        try:
            user_profiles = random.sample(list(UserProfile.objects.filter(~Q(pk=request.user))), 5)
        except ValueError:
            return Response("Not enough user profiles", status=status.HTTP_404_NOT_FOUND)

        response = list(map(user_profile_to_dictionary_object, user_profiles))

        print(response)

        return Response(json.dumps(response, cls=DjangoJSONEncoder), status=status.HTTP_200_OK)


class UserProfileApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        user_id = self.request.query_params.get('user_id', -1)
        if user_id != -1:
            user = User.objects.get(pk=user_id)

        try:
            user_profile = UserProfile.objects.get(pk=user)
        except UserProfile.DoesNotExist:
            user_profile = UserProfile.objects.create(user=user, longitude=0.0, latitude=0.0)

        album_images = []
        if self.request.query_params.get('with_album_images', False) == 'true':
            query = AlbumImage.objects.filter(user=user)
            for image in query:
                album_images.append({
                    "image": encode_image_field_to_base64(image.image),
                    "image_extension": image.image_extension,
                    "created_timestamp": image.created_timestamp,
                })

        response = user_profile_to_dictionary_object(user_profile)
        response["album_images"] = album_images

        return Response(json.dumps(response, cls=DjangoJSONEncoder), status=status.HTTP_200_OK)

    def post(self, request):
        try:
            user_profile = UserProfile.objects.get(pk=request.user)
        except UserProfile.DoesNotExist:
            user_profile = UserProfile.objects.create(user=request.user, longitude=0.0, latitude=0.0)

        try:
            if request.data.get("delete_profile_image", False):
                print("Deleting user profile image")
                user_profile.profile_image.delete()
                user_profile.profile_image_extension = ""
        except FieldDoesNotExist:
            print("Profile image could not be deleted")

        if "profile_image" in request.data:
            try:
                user_profile.profile_image.delete()
            except FieldDoesNotExist:
                print("Profile image could not be deleted")

            image_name = "profile-image-{}.{}".format(request.user.id, request.data.get("profile_image_extension"))
            user_profile.profile_image = ContentFile(base64.b64decode(request.data.get("profile_image")),
                                                     name=image_name)
            user_profile.profile_image_extension = request.data.get("profile_image_extension")

        if "name" in request.data:
            user_profile.name = request.data.get("name")
        if "short_description" in request.data:
            user_profile.short_description = request.data.get("short_description")
        if "long_description" in request.data:
            user_profile.long_description = request.data.get("long_description")
        if "gender" in request.data:
            user_profile.gender = request.data.get("gender")
        if "longitude" in request.data:
            user_profile.longitude = request.data.get("longitude")
        if "latitude" in request.data:
            user_profile.latitude = request.data.get("latitude")

        if "delete_album_images" in request.data:
            for album_image in request.data.get("delete_album_images"):
                try:
                    album_image_entry = AlbumImage.objects.get(user=request.user,
                                                               created_timestamp=album_image["created_timestamp"])
                    album_image_entry.image.delete()
                    album_image_entry.delete()
                except (FieldDoesNotExist, ObjectDoesNotExist) as e:
                    print("Could not delete album image")
                    print(e.message if hasattr(e, 'message') else e)

        user_profile.save()

        if "album_images" in request.data:
            for album_image in request.data.get("album_images"):
                image_name = "album-image-{}-{}.{}".format(request.user.id, album_image["created_timestamp"],
                                                           album_image["image_extension"])
                AlbumImage.objects.create(
                    user=request.user,
                    image=ContentFile(base64.b64decode(album_image["image_content"]), name=image_name),
                    image_extension=album_image["image_extension"],
                    created_timestamp=album_image["created_timestamp"],
                ).save()

        return Response(status=status.HTTP_200_OK)


class AlbumImagesApiView(APIView):
    def get(self, request):
        user = request.user

        user_id = self.request.query_params.get('user_id', -1)
        if user_id != -1:
            user = User.objects.get(pk=user_id)

        album_images = []
        query = AlbumImage.objects.filter(user=user)
        for image in query:
            album_images.append({
                "image": encode_image_field_to_base64(image.image),
                "image_extension": image.image_extension,
                "created_timestamp": image.created_timestamp,
            })

        return Response(json.dumps(album_images, cls=DjangoJSONEncoder), status=status.HTTP_200_OK)
