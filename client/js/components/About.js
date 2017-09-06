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
  right: 50px;
  bottom: 20px;
  font-size: small;
  letter-spacing: 0.06em;
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
          {" "}Sobre esta visualização{" "}
        </OpenModalButton>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h1>Sobre esta visualização</h1>
          <p>
            Deserunt nostrud laborum tempor exercitation eu adipisicing eu qui
            eiusmod commodo consequat elit dolor reprehenderit est quis. Est
            esse dolor et minim dolor aute enim. Elit consequat culpa
            reprehenderit dolore officia velit dolor sint ad commodo mollit.
            Est eiusmod ad deserunt laboris laborum elit ex duis sint tempor.
          </p>

          <p>
            Ipsum tempor qui aliquip ex pariatur ut laborum mollit est enim
            ullamco culpa sunt. Commodo laboris exercitation aute dolor et
            tempor esse tempor nisi sit dolore minim fugiat laborum in
            deserunt anim. Magna voluptate ipsum amet irure consequat irure
            occaecat quis occaecat nulla reprehenderit deserunt elit irure
            dolore velit nostrud.
          </p>

          <p>
            Ad enim nostrud dolor Lorem tempor Lorem Lorem do reprehenderit
            laboris. Mollit duis aute cupidatat deserunt est esse laborum
            commodo eu non cillum officia consequat elit consectetur
            consectetur. Incididunt labore qui officia dolor pariatur qui
            aliquip adipisicing. Consequat aute magna adipisicing ad aute
            eiusmod mollit ipsum.
          </p>
        </Modal>
      </div>
    );
  }
}

export default About;
