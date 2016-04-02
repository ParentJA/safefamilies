# Third-party imports...
from rest_framework import views, viewsets
from rest_framework.exceptions import NotFound
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_204_NO_CONTENT

# Local imports...
from .models import Commitment, Need, Recipient, RecipientNeed
from .serializers import CommitmentSerializer, NeedSerializer, RecipientSerializer, RecipientNeedSerializer


def get_commitments(user):
    return Commitment.objects.select_related('user', 'recipient_need').filter(user=user)


class CommitmentView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, pk):
        try:
            commitment = get_commitments(request.user).get(pk=pk)
        except Commitment.DoesNotExist:
            raise NotFound()

        return Response(status=HTTP_200_OK, data={
            'commitment': CommitmentSerializer(commitment).data
        })

    def list(self, request):
        commitments = get_commitments(request.user)

        return Response(status=HTTP_200_OK, data={
            'commitment': CommitmentSerializer(commitments, many=True).data
        })

    def create(self, request):
        # Update RecipientNeed status to PENDING. A user has committed to providing the requested need,
        # but until the need is fulfilled, the status is PENDING.
        recipient_need = get_object_or_404(RecipientNeed, id=request.data.get('recipient_need'))
        recipient_need.status = RecipientNeed.PENDING
        recipient_need.save()

        # Create the commitment.
        commitment_data = request.data
        commitment_data.update({
            'user': request.user,
            'recipient_need': recipient_need
        })
        commitment_serializer = CommitmentSerializer()
        commitment = commitment_serializer.create(commitment_data)

        return Response(status=HTTP_200_OK, data={
            'commitment': CommitmentSerializer(commitment).data,
            'recipient_need': RecipientNeedSerializer(recipient_need).data
        })

    def update(self, request, pk):
        # Update RecipientNeed status to REQUESTED. A user had committed to providing the requested need,
        # but then that person decided not to commit.
        recipient_need = get_object_or_404(RecipientNeed, id=request.data.get('recipient_need'))
        recipient_need.status = RecipientNeed.REQUESTED
        recipient_need.save()

        try:
            commitment = get_commitments(request.user).get(pk=pk)
        except Commitment.DoesNotExist:
            raise NotFound()
        else:
            # Update the commitment.
            commitment_data = request.data
            commitment_data.update({
                'user': request.user,
                'recipient_need': recipient_need
            })
            commitment_serializer = CommitmentSerializer()
            commitment = commitment_serializer.update(commitment, request.data)

        return Response(status=HTTP_200_OK, data={
            'commitment': CommitmentSerializer(commitment).data,
            'recipient_need': RecipientNeedSerializer(recipient_need).data
        })

    def destroy(self, request, pk):
        try:
            commitment = get_commitments(request.user).get(pk=pk)
        except Commitment.DoesNotExist:
            raise NotFound()
        else:
            # Update RecipientNeed status to REQUESTED. A user had committed to providing the requested need,
            # but then that person decided not to commit.
            recipient_need = commitment.recipient_need
            recipient_need.status = RecipientNeed.REQUESTED
            recipient_need.save()

            # Delete commitment.
            commitment.delete()

        return Response(status=HTTP_200_OK, data={
            'recipient_need': RecipientNeedSerializer(recipient_need).data
        })


class NeedView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        needs = Need.objects.all()
        return Response(status=HTTP_200_OK, data=NeedSerializer(needs, many=True).data)


class RecipientView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recipients = Recipient.objects.all()
        return Response(status=HTTP_200_OK, data=RecipientSerializer(recipients, many=True).data)


class RecipientNeedView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recipient_needs = RecipientNeed.objects.select_related('need', 'recipient')
        recipients = [recipient_need.recipient for recipient_need in recipient_needs]
        needs = [recipient_need.need for recipient_need in recipient_needs]

        return Response(status=HTTP_200_OK, data={
            'recipient_need': RecipientNeedSerializer(recipient_needs, many=True).data,
            'recipient': RecipientSerializer(recipients, many=True).data,
            'need': NeedSerializer(needs, many=True).data
        })
