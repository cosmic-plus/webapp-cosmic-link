"use strict"
/**
 * Signing Flow
 **/
const { CosmicLink, config } = require("cosmic-lib")
const TxResult = require("@cosmic-plus/tx-result")

const { isEmbedded } = require("@kisbox/helpers")

const SigningContext = require("./signing-context")

/* Definition */

class SigningFlow extends SigningContext {
  constructor (params) {
    super(params)
  }

  open () {
    if (!this.uri) return

    // TODO: use an opening callback instead?
    if (
      isEmbedded
      && (this.authenticator.target === "new"
        || this.authenticator.target === "external")
    ) {
      open(this.uri)
      window.parent.postMessage("close", "*")
    } else {
      location.replace(this.uri)
    }
  }

  async sign () {
    if (!this.authenticator.signRequest) return null

    const returned = await this.authenticator.signRequest(this.resolved)
    this.signed = returned || this.resolved
  }
}

/* Computations */
const proto = SigningFlow.prototype

proto.$define(
  "resolved",
  ["authenticator", "accountId", "network", "horizon"],
  function () {
    if (!this.cosmicLink) return

    if (this.needSource && !(this.lockSource || this.accountId)) {
      return new Error("Please set a source account")
    }
    if (this.needNetwork) {
      if (!(this.network || this.lockNetwork)) {
        return new Error("Please set a network")
      } else if (!this.horizon) {
        return new Error("Please set an Horizon address")
      }
    }

    const clone = new CosmicLink(this.cosmicLink.query)
    config.source = this.accountId
    config.network = this.network

    return this.authenticator.resolveRequest(clone, this.authenticator)
  }
)

proto.$on("authenticator", function () {
  this.signed = null
})

proto.$define("uri", ["resolved"], function () {
  if (!this.resolved) {
    return this.authenticator.uri
  } else if (this.authenticator.requestToUri) {
    return this.authenticator.requestToUri(this.resolved, this.authenticator)
  } else {
    return null
  }
})

proto.$define("xdr", ["resolved"], function () {
  if (this.resolved && this.authenticator.requestToXdr) {
    return this.authenticator.requestToXdr(this.resolved, this.authenticator)
  } else {
    return null
  }
})

proto.$define("action", ["resolved"], function () {
  if (this.authenticator.signRequest) {
    return () => this.sign()
  } else {
    return () => this.open()
  }
})

proto.$on("signed", function () {
  if (this.signed) {
    this.query = this.signed.query
  }
})

proto.$define("result", ["signed"], function () {
  return this.signed && TxResult.forCosmicLink(this.signed)
})

/* Export */
module.exports = SigningFlow
