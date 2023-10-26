const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Если не передаём уникальный id, API Не корректно отрабатывает, тесты не проходят.
const petData = { id: 2516, name: "Chester", status: "available" };
let petId = petData.id;

describe("PetStore API tests", () => {
  beforeEach(async () => {
    //Создаём нового питомца при помощи метода POST
    await axios.post("https://petstore.swagger.io/v2/pet", petData);
  });

  // Получаем животное при помощи метода GET
  test("GET /pet/{petId}", async () => {
    const response = await axios.get(
      `https://petstore.swagger.io/v2/pet/${petId}`
    );
    // Проверяем сходится ли он с тем, которого мы создавали
    expect(response.data.id).toBe(petId);
    expect(response.data.name).toBe(petData.name);
  });

  // Получаем животных по статусу при помощи метода GET
  test("GET /pet/findByStatus", async () => {
    const response = await axios.get(
      `https://petstore.swagger.io/v2/pet/findByStatus?status=available`
    );
    expect(response.data[0].status).toBe("available");
    expect(response.data[1].status).toBe("available");
    expect(response.data[2].status).not.toBe("sold");
  });
  // Обновляем данные о питомце при помощи метода PUT
  test("PUT /pet", async () => {
    const putData = { id: petId, name: "Zhora", status: "pending" };
    await axios.put(`https://petstore.swagger.io/v2/pet`, putData);

    // Получаем информацию
    const response = await axios.get(
      `https://petstore.swagger.io/v2/pet/${petId}`
    );

    // Проверяем сходится ли с обновленной
    expect(response.data.name).toBe(putData.name);
    expect(response.data.status).toBe(putData.status);
  });
  // Загружаем картинку
  test("POST /pet/{petId}/uploadImage", async () => {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([fs.readFileSync(path.join(__dirname, "test.png"))])
    );
    const response = await axios({
      method: "post",
      url: `https://petstore.swagger.io/v2/pet/${petId}/uploadImage`,
      data: formData,
      headers: {
        "Content-Type": `multipart/form-data`,
      },
    });

    expect(response.data.message).toMatch(/blob/);
    expect(response.status).toBe(200);
  });

  test("POST /pet/{petId}", async () => {
    formData = { name: "fedor", status: "sold" };
    await axios({
      method: "post",
      url: `https://petstore.swagger.io/v2/pet/${petId}`,
      data: formData,
      headers: {
        "Content-Type": `application/x-www-form-urlencoded`,
      },
    });

    const response = await axios.get(
      `https://petstore.swagger.io/v2/pet/${petId}`
    );
    expect(response.data.name).toBe(formData.name);
    expect(response.data.status).toBe(formData.status);
  });

  afterEach(async () => {
    //Удаляем наше созданное животное при помощи метода DELETE
    await axios.delete(`https://petstore.swagger.io/v2/pet/${petId}`);
  });
});
