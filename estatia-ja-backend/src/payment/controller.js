import paymentService from './service.js';

const paymentController = {
  async create(req, res) {
    try {
      const { reserveId } = req.params;
      const userId = req.user.id;
      const paymentData = req.validatedData;
      const payment = await paymentService.createPayment(
        reserveId,
        userId,
        paymentData
      );
      res.status(200).json(payment.toJSON());
    } catch (error) {
      if (error.message.includes('Esta reserva já foi paga.')) {
        return res.status(409).json({ error: error.message });
      }
      if (
        error.message.includes(
          'Ação não autorizada. Esta reserva não pertence a você.'
        )
      ) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('Reserva não existe.')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },
};

export default paymentController;
