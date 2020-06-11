from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q
from django.db import IntegrityError
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Match, Swipe
from inv_user.models import User

from rest_framework import status
from rest_framework.response import Response

import json
from django.core.serializers.json import DjangoJSONEncoder
import logging

channel_layer = get_channel_layer()

class MatchesApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        matches1 = request.user.user_matched_1.all().values('user_2')
        matches2 = request.user.user_matched_2.all().values('user_1')
        response = []
        for match in matches1:
            response.append({
                "user_id": match['user_2']
            })
        for match in matches2:
            response.append({
                "user_id": match['user_1']
            })
        return Response(json.dumps(response, cls=DjangoJSONEncoder), status=status.HTTP_200_OK)

    def post(self, request):
        try:
            user_action_receiver = User.objects.get(pk=request.data.get("user_action_receiver"))
        except User.DoesNotExist:
            return Response("user_action_receiver does not exist", status=status.HTTP_404_NOT_FOUND)

        try:
            Swipe.objects.create(user_action_maker=request.user, user_action_receiver=user_action_receiver,
                                   swipe_type=request.data.get("swipe_type")).save()
        except IntegrityError:
            return Response("Swipe entry already exists", status=status.HTTP_406_NOT_ACCEPTABLE)

        if self.check_match(request.user, user_action_receiver) == True:
            try:
                print ("in check match ", request.user.pk, user_action_receiver.pk)
                Match.objects.create(user_1=request.user, user_2=user_action_receiver)
                async_to_sync(channel_layer.group_send)(str(request.user.pk), {
                    'type': 'new.message',
                    'text': json.dumps({'type':'new_match', 'matched_with':user_action_receiver.pk})
                })
                async_to_sync(channel_layer.group_send)(str(user_action_receiver.pk), {
                    'type': 'new.message',
                    'text': json.dumps({'type':'new_match', 'matched_with':request.user.pk})
                })
            except IntegrityError:
                return Response("Match entry already exists", status=status.HTTP_406_NOT_ACCEPTABLE)

        return Response(status=status.HTTP_200_OK)

    def check_match (self, maker, receiver):
        try:
            Swipe.objects.get(user_action_maker=receiver, user_action_receiver=maker, swipe_type='L')
            return True
        except Swipe.DoesNotExist:
#         is this correct or should I throw an error?
            print ("\n swipe doesn t exist\n")
            return False
        return False

    def get_match_receiver (self, person, match):
        if person == match[user_1]:
            return match[user_2]
        return match[user_1]
