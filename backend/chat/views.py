import json
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q

from rest_framework.response import Response
from rest_framework import status

# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from inv_user.forms import User
from .models import Message, Chat, MessageTypes, TextMessage


def get_specific_message_data_from_message(message):
    message_type = MessageTypes(message.message_type)

    if message_type == MessageTypes.TEXT_MESSAGE:
        return TextMessage.objects.get(pk=message)
    elif message_type == MessageTypes.IMAGE_MESSAGE:
        print("Server does not support image messages yet.")
        raise ValueError('message_type not supported')
    else:
        raise ValueError('message_type not supported')


def get_message_dictionary_from_message(message):
    message_dic = {
        "id": message.pk,
        "datetime": message.server_received_datetime,
        "is_seen": message.is_seen,
        'created_timestamp': message.created_timestamp,
        "receiver": message.receiver.pk,
        "sender": message.sender.pk,
        'message_type': message.message_type,
    }

    specific_message_data = get_specific_message_data_from_message(message)
    message_type = MessageTypes(message.message_type)

    if message_type == MessageTypes.TEXT_MESSAGE:
        message_dic['text'] = specific_message_data.text

    elif message_type == MessageTypes.IMAGE_MESSAGE:
        print("Server does not support image messages yet.")
        raise ValueError('message_type not supported')

    else:
        raise ValueError('message_type not supported')

    return message_dic


class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u1 = self.request.query_params.get('receiver')
        u2 = request.user.pk

        query = Message.objects.filter(Q(sender=u1, receiver=u2) | Q(sender=u2, receiver=u1)).order_by(
            'server_received_datetime')

        messages = []
        for message in query:
            messages.append(get_message_dictionary_from_message(message))

        return Response(json.dumps({"messages": messages}, cls=DjangoJSONEncoder), status=status.HTTP_200_OK)


class ChatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = Chat.objects.filter(owner=request.user.pk).order_by('-last_msg_datetime')
        chats = []
        for chat in query:
            chats.append(
                {
                    "id": chat.pk,
                    "receiver": chat.receiver.pk,
                    "last_msg_datetime'": chat.last_msg_datetime,
                }
            )
        return Response(json.dumps({"chats": chats}, cls=DjangoJSONEncoder), status=status.HTTP_200_OK)

    def post(self, request):
        receiver = User.objects.get(pk=request.data['receiver'])
        new_chat = Chat.objects.create(
            owner=request.user,
            receiver=receiver,
        )

        new_chat.save()

        # Create the chat for the receiver
        Chat.objects.create(
            owner=receiver,
            receiver=request.user,
        ).save()

        return Response(json.dumps({"id": new_chat.pk, "receiver": request.data['receiver']}),
                        status=status.HTTP_201_CREATED)

    def delete(self, request):

        chat = Chat.objects.get(pk=self.request.query_params.get('id'))

        if request.user.pk == chat.owner.pk:
            chat.delete()
            return Response(status=status.HTTP_200_OK)

        return Response({"Only the owner can delete this"}, status=status.HTTP_406_NOT_ACCEPTABLE)
