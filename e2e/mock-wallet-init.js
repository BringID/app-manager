// Mock EIP-1193 wallet provider for E2E tests.
// Globals __E2E_ADDRESS__ and __E2E_ALCHEMY_RPC__ are set via page.evaluate before navigation.
(function () {
  if (!window.__E2E_ADDRESS__) return;

  var ADDRESS = window.__E2E_ADDRESS__;
  var ALCHEMY_RPC = window.__E2E_ALCHEMY_RPC__;
  var CHAIN_ID = "0x14a34"; // 84532 (Base Sepolia)
  // Persist connection state across navigations via sessionStorage
  var connected = false;
  try { connected = sessionStorage.getItem("__e2e_connected") === "1"; } catch (e) {}

  var provider = {
    _events: {},
    on: function (event, fn) {
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(fn);
      return this;
    },
    removeListener: function (event, fn) {
      this._events[event] = (this._events[event] || []).filter(function (f) {
        return f !== fn;
      });
      return this;
    },
    emit: function (event) {
      var args = Array.prototype.slice.call(arguments, 1);
      (this._events[event] || []).forEach(function (fn) {
        fn.apply(null, args);
      });
    },
    request: function (req) {
      var method = req.method;
      var params = req.params;
      switch (method) {
        case "eth_requestAccounts":
          connected = true;
          try { sessionStorage.setItem("__e2e_connected", "1"); } catch (e) {}
          return Promise.resolve([ADDRESS]);
        case "eth_accounts":
          return Promise.resolve(connected ? [ADDRESS] : []);
        case "eth_chainId":
          return Promise.resolve(CHAIN_ID);
        case "net_version":
          return Promise.resolve("84532");
        case "wallet_switchEthereumChain":
        case "wallet_addEthereumChain":
          return Promise.resolve(null);
        case "wallet_getPermissions":
          return Promise.resolve([]);
        case "wallet_requestPermissions":
          connected = true;
          try { sessionStorage.setItem("__e2e_connected", "1"); } catch (e) {}
          return Promise.resolve(params && params[0] ? [params[0]] : []);
        case "eth_sendTransaction":
          return window.__e2e_sendTransaction(params[0]);
        default:
          return fetch(ALCHEMY_RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: Date.now(),
              method: method,
              params: params || [],
            }),
          })
            .then(function (res) {
              return res.json();
            })
            .then(function (json) {
              if (json.error) throw new Error(json.error.message);
              return json.result;
            });
      }
    },
  };

  var info = Object.freeze({
    uuid: crypto.randomUUID(),
    name: "E2E Wallet",
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    rdns: "dev.e2e.wallet",
  });

  var detail = Object.freeze({ info: info, provider: provider });

  window.addEventListener("eip6963:requestProvider", function () {
    window.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", { detail: detail })
    );
  });
  window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", { detail: detail })
  );
})();
