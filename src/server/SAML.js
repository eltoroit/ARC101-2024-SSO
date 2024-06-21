import path from "path";
import saml from "samlify";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";

export default class SAML {
	sp;
	idp;
	util = null;

	constructor({ util }) {
		// debugger;
		this.util = util;
		this.util.saml = this;
		this.initialize();
	}

	initialize() {
		this.sp = saml.ServiceProvider({
			metadata: readFileSync(path.resolve("samlMetadata/SAML_SP.xml")),
		});

		this.idp = saml.IdentityProvider({
			metadata: readFileSync(path.resolve("samlMetadata/SAML_SP.xml")),
			privateKey: readFileSync(path.resolve("cert/private.key")),
			// privateKeyPass: "jXmKf9By6ruLnUdRo90G",
			isAssertionEncrypted: false,
			loginResponseTemplate: {
				context: `
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="{ID}" Version="2.0" IssueInstant="{IssueInstant}" Destination="{Destination}" InResponseTo="{InResponseTo}">
    <saml:Issuer>{Issuer}</saml:Issuer>
    <samlp:Status>
        <samlp:StatusCode Value="{StatusCode}" />
    </samlp:Status>
    <saml:Assertion ID="{AssertionID}" Version="2.0" IssueInstant="{IssueInstant}"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
        <saml:Issuer>{Issuer}</saml:Issuer>
        <saml:Subject>
            <saml:NameID Format="{NameIDFormat}">{username}</saml:NameID>
            <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <saml:SubjectConfirmationData NotOnOrAfter="{SubjectConfirmationDataNotOnOrAfter}" Recipient="{SubjectRecipient}" InResponseTo="{InResponseTo}" />
            </saml:SubjectConfirmation>
        </saml:Subject>
        <saml:Conditions NotBefore="{ConditionsNotBefore}" NotOnOrAfter="{ConditionsNotOnOrAfter}">
            <saml:AudienceRestriction>
                <saml:Audience>{Audience}</saml:Audience>
            </saml:AudienceRestriction>
        </saml:Conditions>
        {AttributeStatement}</saml:Assertion>
</samlp:Response>`,
				attributes: [
					{
						name: "firstName",
						valueTag: "firstName",
						nameFormat: "urn:oasis:names:tc:SAML:2.0:attrname-format:basic",
						valueXsiType: "xs:string",
					},
					{
						name: "lastName",
						valueTag: "lastName",
						nameFormat: "urn:oasis:names:tc:SAML:2.0:attrname-format:basic",
						valueXsiType: "xs:string",
					},
				],
			},
		});
	}

	async federatedSSO_IdP(req, res) {
		try {
			const user = { email: "user@gmail.com" };
			const { context, entityEndpoint } = await this.idp.createLoginResponse(
				this.sp,
				null,
				saml.Constants.wording.binding.post,
				user,
				this.#createTemplateCallback(user.email)
			);

			res.status(200).send({ samlResponse: context, entityEndpoint });
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	}

	async federatedSSO_SP(req, res) {
		debugger;
		console.log(req);
		console.log(res);
		// throw "Failed to login ELTOROIT";
	}

	metadataIdP(req, res) {
		res.type("application/xml");
		res.send(this.idp.getMetadata());
	}

	#generateRequestID() {
		return "_" + randomUUID();
	}

	#createTemplateCallback(email) {
		return (template) => {
			const assertionConsumerServiceUrl = this.sp.entityMeta.getAssertionConsumerService(saml.Constants.wording.binding.post);

			const nameIDFormat = this.idp.entitySetting.nameIDFormat;
			const selectedNameIDFormat = Array.isArray(nameIDFormat) ? nameIDFormat[0] : nameIDFormat;

			const id = this.#generateRequestID();
			const now = new Date();
			let fiveMinutesLater = new Date();
			fiveMinutesLater = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);

			const tagValues = {
				ID: id,
				AssertionID: this.#generateRequestID(),
				Destination: assertionConsumerServiceUrl,
				Audience: this.sp.entityMeta.getEntityID(),
				EntityID: this.sp.entityMeta.getEntityID(),
				SubjectRecipient: assertionConsumerServiceUrl,
				Issuer: this.idp.entityMeta.getEntityID(),
				IssueInstant: now.toISOString(),
				AssertionConsumerServiceURL: assertionConsumerServiceUrl,
				StatusCode: "urn:oasis:names:tc:SAML:2.0:status:Success",
				ConditionsNotBefore: now.toISOString(),
				ConditionsNotOnOrAfter: fiveMinutesLater.toISOString(),
				SubjectConfirmationDataNotOnOrAfter: fiveMinutesLater.toISOString(),
				NameIDFormat: selectedNameIDFormat,
				NameID: email,
				InResponseTo: "null",
				AuthnStatement: "",
				/**
				 * Custom attributes
				 */
				attrFirstName: "Jon",
				attrLastName: "Snow",
			};

			return {
				id,
				context: saml.SamlLib.replaceTagsByValue(template, tagValues),
			};
		};
	}
}
