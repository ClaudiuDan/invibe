from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q
from django.db import IntegrityError

from .models import Matches
from inv_user.models import User

from rest_framework import status
from rest_framework.response import Response

import json
from django.core.serializers.json import DjangoJSONEncoder


class MatchesApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        matches = request.user.user_matched_by.filter(match_status='L',
                                                      user_action_maker__in=request.user.user_matched.filter(
                                                          match_status='L').values('user_action_receiver')) \
            .values('user_action_maker')

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
            Matches.objects.create(user_action_maker=request.user, user_action_receiver=user_action_receiver,
                                   match_status=request.data.get("match_status")).save()
        except IntegrityError:
            return Response("Match entry already exists", status=status.HTTP_406_NOT_ACCEPTABLE)

        return Response(status=status.HTTP_200_OK)
