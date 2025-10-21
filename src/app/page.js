"use client";
import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider"
import subastaManifest from "../contracts/Subasta.json"
import { ethers, Contract } from "ethers"
import { decodeError } from "@ubiquity-os/ethers-decode-error";
import { Container } from "react-bootstrap";

export default function Home() {
  const myContract = useRef(null);

  useEffect( () => {
    let init = async () => {
      await configurarBlockchain();
    }
    init();
  }, [])

 /**
 * Configura la red blockchain y carga el contrato Subasta
 *
 * @returns {void}
 */
  const configurarBlockchain = async () => {
    try {
      const provider = await detectEthereumProvider();

      if (provider) {
        await provider.request({method: "eth_requestAccounts"});
        let providerEthers = new ethers.providers.Web3Provider(provider);
        let signer = providerEthers.getSigner();
        myContract.current = new Contract(
          "0x60a392e720e54b80405a9a95878de57a5416099e",
          subastaManifest.abi,
          signer
        );
  
      } else {
        console.log("No se puede conectar con el provider")
      }  
    } catch (err) {
      const error = decodeError(err);
      alert(error.error);
    }
  }

  return (
    <Container>

    </Container>
  );
}
