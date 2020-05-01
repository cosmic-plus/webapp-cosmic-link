"use strict"
/**
 * Redirection Form
 * */
const { View, html } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

const QrCodeSwitcher = require("./qr-code-switcher")
const RedirectionButton = require("./redirection-button")
const TxResultView = require("./tx-result-view")
const XdrArea = require("./xdr-area")

/* Definition */

class RedirectionForm extends View {
  constructor (signingFlow) {
    super(`
<form class="RedirectionForm" hidden=%not:showButton>
  %redirectionButton
  <div $ref="messageBox"></div>
  %txResultView
</form>


<form hidden=%not:showTextarea>
  %xdrArea
</form>

<div hidden=%not:showQrCodeSwitcher>
  %qrCodeSwitcher
</div>
    `)

    this.$import(signingFlow, [
      "cosmicLink",
      "authenticator",
      "action",
      "result"
    ])

    // Components
    this.redirectionButton = new RedirectionButton(signingFlow)
    this.xdrArea = new XdrArea(signingFlow)
    this.qrCodeSwitcher = new QrCodeSwitcher(signingFlow)
  }
}

/* Computations */
const proto = RedirectionForm.prototype

proto.$define("showButton", ["authenticator"], function () {
  return this.authenticator.redirection
})

proto.$define("showTextarea", ["authenticator"], function () {
  return this.authenticator.textarea
})

proto.$define(
  "showQrCodeSwitcher",
  ["cosmicLink", "authenticator"],
  function () {
    return this.cosmicLink && this.authenticator.qrCode
  }
)

proto.$customDefine("txResultView", ["result"], function () {
  if (type(this.result) === "error") {
    return html("span", { className: "error" }, this.result.message)
  } else {
    return new TxResultView(this.result)
  }
})

/* Export */
module.exports = RedirectionForm
