"use client";
import { useState, type FormEvent } from "react";
export function ContactForm() {
  const [message, setMessage] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Alanlar kontrol edildi. Mesaj gönderilmedi; lütfen e-posta veya telefon ile iletişime geçin.",
    );
    event.currentTarget.reset();
  }
  return (
    <form onSubmit={handleSubmit} id={"contact-form"} className={"form-shell"}>
      <div className={"form-grid"}>
        <div className={"field"}>
          <label htmlFor={"name"}>{"AD SOYAD"}</label>
          <input
            id={"name"}
            name={"name"}
            autoComplete={"name"}
            placeholder={"Adınız Soyadınız"}
            required={true}
          />
        </div>
        <div className={"field"}>
          <label htmlFor={"email"}>{"E-POSTA"}</label>
          <input
            id={"email"}
            name={"email"}
            type={"email"}
            autoComplete={"email"}
            placeholder={"ornek@eposta.com"}
            required={true}
          />
        </div>
        <div className={"field wide"}>
          <label htmlFor={"topic"}>{"KONU"}</label>
          <select id={"topic"} required={true}>
            <option value={""}>{"Konu seçiniz"}</option>
            <option>{"Genel iletişim"}</option>
            <option>{"Kurumsal iş birliği"}</option>
            <option>{"Diğer"}</option>
          </select>
        </div>
        <div className={"field wide"}>
          <label htmlFor={"message"}>{"MESAJINIZ"}</label>
          <textarea
            id={"message"}
            name={"message"}
            placeholder={"Mesajınızı buraya yazın..."}
            required={true}
          ></textarea>
        </div>
      </div>
      <p className={"form-note"}>
        {
          "Bu form şu anda mesaj göndermiyor. Göndermek için yukarıdaki doğrudan iletişim bilgilerini kullanın."
        }
      </p>
      <button className={"btn solid"} type={"submit"}>
        {"Formu Kontrol Et "}
        <span className={"arrow"}>{"↗"}</span>
      </button>
      <div
        id="form-message"
        className="form-message"
        role="status"
        aria-live="polite"
      >
        {message}
      </div>
    </form>
  );
}
