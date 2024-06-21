# Notes

-   Sample project created following [this guide](https://lwc.dev/guide/install#via-rollup)
-   LWC gets compiles using `rollup --config rollup.config.js`
-   SLDS is download [from here](https://www.lightningdesignsystem.com/resources/downloads/)
    -   `npm install @salesforce-ux/design-system --save`

# OAuth

-   ???

# SSO

## Delegated SSO

-   Add permission set `psDelegatedSSO`
-   Configure SSO
    -   Gateway (postman): https://288a8e30-f19d-4f67-b776-7d0af2d91064.mock.pstmn.io/delegatedSSO

## Federated SSO

-   Generate IdP Metadata
    -   URL: https://www.samltool.com/idp_metadata.php
    -   Configure
        -   EntityId: ELTORO.IT
        -   Single Sign On Service Endpoint (HTTP-REDIRECT): https://localhost:4001/federatedSSO_IdP
        -   SP X.509 cert: cert/public.crt
        -   NameId Format: urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified
    -   Click [Build IdP Metadata]
    -   Save file as [samlMetadata/SAML_IdP.xml]
-   Setup Salesforce
    -   Setup > Identity > Single Sign-On Settings
    -   Edit
    -   Select SAML Enabled
    -   Save
    -   Click [New From Metadata]
    -   Choose file [samlMetadata/SAML_SP.xml]
    -   Click [Create]
    -   Save
    -   Click [Download Metadata]
    -   Save as [@ELTORO.it/SAML_SP.xml]
-
