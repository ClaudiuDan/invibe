from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q
from django.db import IntegrityError

from .models import Match, Swipe
from inv_user.models import User

from rest_framework import status
from rest_framework.response import Response

import json
from django.core.serializers.json import DjangoJSONEncoder
import logging

class MatchesApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        matches = request.user.user_matched_by.filter(match_status='L',
                                                      user_action_maker__in=request.user.user_matched.filter(
                                                          match_status='L').values('user_action_receiver')) \
            .values('user_action_maker')
        matches = request.user.user_matched_by
        response = []
        for match in matches:
            response.append({
                "user_id": match["user_action_maker"]
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
                Match.objects.create(user_1=request.user, user_2=user_action_receiver)
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
