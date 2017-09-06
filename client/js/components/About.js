import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import styled from "styled-components";

const customStyles = {
  overlay: {
    zIndex: 10
  },
  content: {
    top: "50%",
    left: "50%",
    right: "50%",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

const OpenModalButton = styled.a`
  position: absolute;
  right: 70px;
  bottom: 30px;
  display: inline-block;
  padding: .7rem 1.5rem;
  border: 1px solid #ccc;
  color: rgb(114,135,144);
  border-radius: .25em;
  margin: 0 0 .5rem;
  cursor: pointer;
  font-size: .8em;
  text-transform: uppercase;
  text-decoration: none;
  text-align: center;
  line-height: 1;
  &:hover,
  &:active,
  &:focus {
    color: rgb(114,135,144);
    border-color: rgb(114,135,144);
  }
`;

class About extends React.Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  render() {
    return (
      <div>
        <OpenModalButton onClick={this.openModal}>
          {" "}Sobre{" "}
        </OpenModalButton>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <p>
            Você sabe dizer qual a diferença salarial entre mulheres e homens
            empregados na sua profissão? Essa visualização busca evidenciar a
            brecha salarial de gênero. Para navegar, escolha uma carreira na
            caixa de busca ou passe o mouse sobre as barras interativas.
          </p>

          <p>
            A visualização foi gerada a partir dos dados estatísticos do
            Cadastro Geral de Empregados e Desempregados – CAGED, relativos a
            todos os meses de 2016. A base do CAGED abrange os trabalhadores
            regidos pela CLT, ou seja, em situação formal de trabalho. A leitura
            dos dados deve ser feita levando em consideração esse aspecto, o
            que, no caso de profissões em que a informalidade é predominante,
            pode gerar distorções na análise.
          </p>
          <p>
            <a href="data.csv" download>
              Baixe aqui a base de dados em formato CSV.
            </a>
          </p>
        </Modal>
      </div>
    );
  }
}

export default About;
