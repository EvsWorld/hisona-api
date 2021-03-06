'use strict';

const fs = require('fs');

const LimduClassifier = require('../services/limdu-classifier');

const ConversationLogic = {
	/**
	 * Creates the reply from the incoming message data
	 *
	 * @param {object} messageData The message sent from the client
	 */
	async respondToMessage(messageData) {
		// get the intent from the message
		const intent = await ConversationLogic.getIntent(messageData);

		// map the intent to the reply
		const replyFromIntent = await ConversationLogic.mapIntentToReply(
			messageData,
			intent
		);

		const replyData = {
			collection_ref: messageData.collectionRef,
			artefact_id: messageData.artefactId,
			intent: intent || 'default',
			reply: replyFromIntent || [{
				content_type: 'text',
				direction: 'left',
				text: 'Sorry I did not understand that.'
			}]
		};

		return replyData;
	},

	/**
	 * Returns a list of intents based on the message string
	 *
	 * @param {object} data The message sent from the client
	 */
	async getIntent({ artefactId, messageToUnderstand }) {
		try {
			const intent = await LimduClassifier.classifyQuery({
				artefactId,
				messageToUnderstand
			});

			if (!intent) {
				throw new Error(`No matching intent from the client`);
			}

			return intent[0];
		} catch (err) {
			console.log(err);
		}
	},

	/**
	 * Maps the decoded intent to a reply response object
	 *
	 * @param {string} collectionRef The collection ID
	 * @param {string} artefactId The artefact ID
	 * @param {string} intent The intent used to map to a reply
	 */
	async mapIntentToReply({ collectionRef, artefactId }, intent) {
		try {
			const intentAction = {
				collectionRef,
				artefactId,
				intent
			};

			const data = fs.readFileSync(
				`./mock-data/responses/${intentAction.artefactId}.json`
			);

			const responses = JSON.parse(data);

			const replyData = responses.filter(r => r.intent === intentAction.intent);

			if (!replyData.length) {
				throw new Error(
					'No response matched the given intent, the default message has been sent.'
				);
			}

			return replyData[0].reply;
		} catch (e) {
			console.log(e);
		}
	}
};

module.exports = ConversationLogic;
