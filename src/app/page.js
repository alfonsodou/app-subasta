"use client";
import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider"
import subastaManifest from "../contracts/Subasta.json"
import { ethers, Contract } from "ethers"
import { decodeError } from "@ubiquity-os/ethers-decode-error";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const myContract = useRef(null);
  const [minBid, setMinBid] = useState(0);
  const [maxBid, setMaxBid] = useState(0);
  const [maxBidAddress, setMaxBidAddress] = useState();
  const [deadLine, setDeadLine] = useState(0);
  const [description, setDescription] = useState("");
  const [bid, setBid] = useState(0);
  const [active, setActive] = useState(0);

  useEffect( () => {
    let init = async () => {
      await configurarBlockchain();
      await cargarDatos();
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
          "0x5dc0295467ab7d07420d2a10c3d88336ba16ef9a",
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

  /**
  * Almacena los datos del contrato
  *
  * @returns {void}
  */
  const cargarDatos = async () => {
   try {  
      let descriptionTemp = await myContract.current.description();
      setDescription(descriptionTemp);

      let deadlineMinutes = await myContract.current.deadLine();
      let deadlineDate = new Date(deadlineMinutes * 1000);
      setDeadLine(deadlineDate.toLocaleString());      

      let minBidWei = await myContract.current.minBid();
      let minBidBNB = ethers.utils.formatEther(minBidWei);
      setMinBid(minBidBNB);    
      
      await cargarDatosDinamicos();
    } catch (err) {
      const error = decodeError(err);
      alert(error.error);
    }
  };

  /**
  * Almacena los datos dinámicos del contrato
  *
  * @returns {void}
  */
  const cargarDatosDinamicos = async () => {
    try {  
      let maxBidWei = await myContract.current.maxBid();
      let maxBidBNB = ethers.utils.formatEther(maxBidWei);
      setMaxBid(maxBidBNB);

      let maxBidAddressTemp = await myContract.current.addressMaxBid();
      setMaxBidAddress(maxBidAddressTemp);

      let activeTemp = await myContract.current.isActive()      
      setActive(activeTemp);      
    } catch (err) {
      const error = decodeError(err);
      alert(error.error);
    }
  };

  /**
   * Realiza una puja
   */
  let makeBid = async () => {
    try {
      const tx = await myContract.current.makeBid({
        value: ethers.utils.parseEther(bid)
      })
  
      await tx.wait();
      setBid(0);
      
      // Actualizamos los datos del contrato que se han modificado
      cargarDatosDinamicos();  
    } catch(err) {
      const error = decodeError(err);
      alert(error.error);
    }
  }

  return (
    <Container>
      <Row>
        <Col>
          <Alert>
            <Alert.Heading>
              <p align="center">Bienvenido a la aplicación de Subastas</p>
            </Alert.Heading>
          </Alert>
        </Col>
      </Row>
      <h1>Description: {description}</h1>
      <h1>DeadLine: {deadLine}</h1>
      <h1>MinBid: {minBid}</h1>
      <h1>MaxBid: {maxBid}</h1>
      <h1>Address Max Bid: {maxBidAddress}</h1>
      <h1>isActive: {active.toString()}</h1>
      <input 
        type="text" 
        value={ bid } 
        onChange={ (e) => setBid(e.target.value) }/>
      <Button variant="primary" onClick={ () => { makeBid() }}>
        Send
      </Button>
    </Container>
  );
 
}
