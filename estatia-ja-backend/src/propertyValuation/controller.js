import propertyValuationService from './service.js';

const propertyValuationController = {
  async create(req, res) {
    try {
      const { reserveId } = req.params;
      const userId = req.user.id;
      const valuationData = req.validatedData;

      const valuation = await propertyValuationService.createPropertyValuation(
        reserveId,
        userId,
        valuationData
      );

      res.status(201).json(valuation.toJson());
    } catch (error) {
      if (error.message.includes('Esta reserva já foi avalia.')) {
        return res.status(409).json({ error: error.message });
      }
      if (
        error.message.includes(
          'Ação não autorizada. Você não pode avaliar uma reserva que não é sua.'
        )
      ) {
        return res.status(403).json({ error: error.message });
        n;
      }
      if (error.message.includes('Reserva não encontrada.')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },

  async getByProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const valuationProperty =
        await propertyValuationService.getValuationsByProperty(propertyId);
      res
        .status(200)
        .json(valuationProperty);
    } catch (error) {
      if (
        error.message.includes('Nenhuma avaliação encontrada para este imóvel')
      ) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
  },

  async delete(req, res) {
    try {
      const { valuationId } = req.params;
      const userId = req.user.id;
      await propertyValuationService.deletePropertyValuation(
        valuationId,
        userId
      );
      res.status(204).send();
    } catch (error) {
      if (
        error.message.includes(
          'Ação não autorizada. Vacê não pode deletar uma avaliação que não é sua.'
        )
      ) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('Reserva não encontrada.')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },
};

export default propertyValuationController;
