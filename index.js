fetch("./JSON-shema.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => console.log(randomObject(data)));

//
function randomObject(jsonSchema) {
  if (jsonSchema?.type !== "object") {
    alert("Передайте JSONschema.type == 'object'");
    return;
  }

  const { definitions } = jsonSchema;
  const finalObject = getShemaObject(jsonSchema);

  return normalizeDate(finalObject);

  // helpful functions
  function handleSchemaProperty(propValue) {
    const { type, anyOf, $ref } = propValue;

    let outputPropValue = propValue;

    const Enum = propValue.enum;
    if (Enum) return getEnum(Enum);

    if (anyOf?.constructor === Array) return handleAnyOf(anyOf);

    if (type) return handleType(type, propValue);

    if ($ref) return getRef($ref);

    return outputPropValue;
  }
  function getShemaObject(objectSchema) {
    const { required, properties } = objectSchema;
    if (!properties) return {};

    const requiredProps = required;

    const outputObj = Object.keys(properties).reduce((acc, key) => {
      const isRequiredKey = !!(requiredProps && ~requiredProps.indexOf(key));
      const isKeyAdd = isRequiredKey || randomBoolean();
      // const isKeyAdd = true;
      if (!isKeyAdd) return acc;

      return (acc = {
        ...acc,
        ...{ [key]: handleSchemaProperty(properties[key]) },
      });
    }, {});
    return outputObj;
  }
  //
  function handleType(type, propValue) {
    const obj = {
      string: getString(propValue),
      integer: getInteger(propValue),
      boolean: randomBoolean(),
      null: (() => null)(),
      array: getArray(propValue),
      object: getShemaObject(propValue),
    };
    return obj[type];
  }
  function handleAnyOf(anyOf) {
    const rndmIndex = getRandomInteger(0, anyOf.length - 1);
    return handleSchemaProperty(anyOf[rndmIndex]);
  }
  function getInteger(propValue) {
    const { minimum, maximum } = propValue;
    const min = minimum ?? 1;
    const max = maximum ?? 10001;
    return getRandomInteger(min, max);
  }
  function getString(propValue) {
    const { format, pattern } = propValue;
    if (!pattern && format !== "regex") return getRandomString("[0-9a-zA-Z]+");

    let retundString = pattern.split("\\").map((item) => {
      const [slash, ...ptrn] = item;
      const rndStr = getRandomString(ptrn.join(""));
      return rndStr ? slash + rndStr : item;
    });

    return retundString.flat().join("");
  }
  function getArray(propValue) {
    const { items } = propValue;
    const arr = [];
    if (!items) return arr;

    for (let index = 0; index < getRandomInteger(1, 3); index++) {
      arr.push(handleSchemaProperty(items));
    }
    return arr;
  }
  function getRef($ref) {
    const [mark, ...ref] = $ref;
    return getShemaObject(definitions[ref.join("")]);
  }
  function getEnum(Enum) {
    return Enum[getRandomInteger(0, Enum.length - 1)];
  }
  //
  function randomBoolean() {
    const rndmBoolean = !!(getRandomInteger(0, 1000) % 2);
    // console.log("randomBoolean", rndmBoolean);
    return rndmBoolean;
  }
  function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  function getRandomString(pattern) {
    const symbols = {
      "[a-z]+": /[^a-z]/g,
      "[0-9]+": /[^0-9]/g,
      "[A-Z]+": /[^A-Z]/g,
      "[0-9a-zA-Z]+": /[^0-9a-zA-Z]/g,
      filteredString: (regExp) =>
        "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789".replace(
          regExp,
          ""
        ),
    };

    if (!symbols[pattern]) return false;

    const validCharacters = symbols.filteredString(symbols[pattern]);
    const strLength = getRandomInteger(1, 8);
    const validCharArr = [];
    for (let i = 0; i < strLength; ++i) {
      validCharArr.push(
        validCharacters[getRandomInteger(0, validCharacters.length - 1)]
      );
    }

    return validCharArr.join("");
  }
  //
  function normalizeDate(finalObject) {
    let { startDate: start, endDate: end } = finalObject;
    const [startDate, endDate] = [start, end].sort();
    return {
      ...finalObject,
      startDate,
      endDate,
    };
  }
}
