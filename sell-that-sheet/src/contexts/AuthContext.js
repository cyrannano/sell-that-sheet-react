import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const api = axios.create({
  // baseURL: 'http://172.27.198.154:8000/' // For development,
  baseURL: "http://172.27.70.154:8000/",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    return isAuthenticated;
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await api.post("/api/login/", { username, password });
      const { token, userData } = data;
      localStorage.setItem("authToken", token); // For enhanced security, consider using httpOnly cookies
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      return Promise.reject(error.response.data); // Handling errors
    }
  };

  const logout = () => {
    const { data } = api
      .post("/api/logout/")
      .then(() => {
        localStorage.removeItem("authToken");
        setUser(null);
        setIsAuthenticated(false);
      })
      .catch((error) => {
        console.error(error.response.data); // Handling errors
        localStorage.removeItem("authToken");
      });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const makeAllegroAuthCall = async () => {
  const response = await api.get("/allegro/login/");
  // the enpoint returns a URL to open in a new tab
  window.open(response.data.authorization_url, "_blank");
};

export const browseDirectory = async (directory) => {
  let dirpath = directory.map((item) =>
    item.name == "Zdjęcia" ? "" : item.name
  );
  if (dirpath.length > 1) {
    // remove root directory
    dirpath.shift();
  }
  dirpath = dirpath.join("/");
  const response = await api.get(`/api/browse/${dirpath}`);
  return response.data;
};

export const getCategoryParameters = async (category) => {
  const response = await api.get(
    `/allegro/get-category-parameters/${category}`
  );
  return response.data;
};

export const matchCategory = async (productName) => {
  if (productName === "" || productName === null || productName.length < 5) {
    return [];
  }
  const response = await api.get(`/allegro/match-category/${productName}`);
  return response.data.matchingCategories;
};

export const getCategoryById = async (categoryId) => {
  const response = await api.get(`/allegro/get-category-by-id/${categoryId}`);
  // if error response code return error
  if (response.data.errors && response.data.errors.length > 0) {
    return Promise.reject(response.data.errors[0]);
  }
  return response.data;
};

const paramNameTranslation = {
  name: "Nazwa",
  price_pln: "Cena",
  price_euro: "Cena w Euro",
  tags: "Tagi",
  description: "Opis",
  serial_numbers: "Numery seryjne",
  shipment_price: "Cena wysyłki",
  category: "Kategoria",
  amount: "Ilość",
};

const requiredBaseParameters = ["name", "price_pln", "shipment_price"];
const disabledBaseParameters = ["id", "photoset", "category", "created_at"];
const ignoredBaseParameters = ["translated_params"];

const getParamType = (param) => {
  if (param.name == "description") {
    return "textarea";
  }

  if (param.type.includes("Char")) {
    return "string";
  } else if (param.type.includes("Float")) {
    return "float";
  } else {
    return "string";
  }
};

export const createCategoryOfferObject = async (categoryId) => {
  const categoryParameters = await getCategoryParameters(categoryId);
  const offerModel = await api.get("/model-structure/sell_that_sheet/auction");
  const withoutIgnoredBaseParameters = offerModel.data.structure.filter(
    (param) => !ignoredBaseParameters.includes(param.name)
  );
  const baseParameters = withoutIgnoredBaseParameters.map((param) => {
    return {
      name: param.name,
      displayName: paramNameTranslation[param.name] || param.name,
      id: param.name + "Base",
      type: getParamType(param),
      base: true,
      value: param.name === "category" ? categoryId : "",
      required: requiredBaseParameters.includes(param.name),
      disabled: disabledBaseParameters.includes(param.name),
    };
  });

  const parameters = baseParameters.concat(categoryParameters.parameters);
  return parameters;
};

export const addPhotos = async (photos) => {
  return Promise.all(photos.map((photo) => addPhoto(photo)));
};

export const addPhoto = async (photo) => {
  // returns {id: 1, name: 'photo.jpg'}
  const response = await api.post("/photos/", { name: photo });
  return response.data;
};

export const createPhotoSet = async (photos, directory, thumbnail) => {
  if (!photos.includes(thumbnail)) {
    photos = [thumbnail, ...photos];
  }

  const addedPhotos = await addPhotos(photos);
  const thumbnailId = addedPhotos.find((photo) => photo.name === thumbnail).id;
  console.log(thumbnail, addedPhotos, thumbnailId);
  const addedPhotosIds = addedPhotos.map((photo) => photo.id);
  const photoset = {
    directory_location: directory,
    thumbnail: thumbnailId,
    photos: addedPhotosIds,
  };

  const response = await api.post("/photosets/", photoset);
  return response.data;
};

export const getPhotosetThumbnailURL = async (photosetId) => {
  const response = await api.get(`/photosets/${photosetId}`);
  const thumbnailId = response.data.thumbnail;
  const thumbnailref = response.data.directory_location;

  const thumbnailResponse = await api.get(`/photos/${thumbnailId}`);

  return `http://172.27.70.154/thumbnails/${thumbnailref}/${thumbnailResponse.data.name}`;
};

// Function to add an auction
export const addAuction = async (auctionData) => {
  const response = await api.post("/auctions/", auctionData);
  return response.data; // Should return the created auction with its ID
};

export const updateAuction = async (auctionId, auctionData) => {
  const response = await api.put(`/auctions/${auctionId}/`, auctionData);
  return response.data; // Should return the updated auction
};

// Function to get a parameter by allegro_id
export const getParameter = async (allegro_id) => {
  const response = await api.get(`/parameters/?allegro_id=${allegro_id}`);
  if (response.data.length > 0) {
    return response.data[0]; // Assuming the API returns a list
  }
  return null;
};

// Function to add a new parameter
export const addParameter = async (allegro_id, name, type) => {
  const response = await api.post("/parameters/", {
    allegro_id,
    name: name,
    type: type,
  });
  return response.data;
};

// Function to add an auction parameter
export const addAuctionParameter = async (auctionParameterData) => {
  const response = await api.post("/auctionparameters/", auctionParameterData);
  return response.data;
};

// Function to add an auction set
export const addAuctionSet = async (auctionSetData) => {
  const response = await api.post("/auctionsets/", auctionSetData);
  return response.data;
};

const getCustomParamTranslations = (customParam, to_translate) => {
  // if to_translate is an array, find the translation for each value
  if (Array.isArray(to_translate)) {
    const translations = to_translate.map((value) => {
      const index = customParam.possible_values_pl.indexOf(value);
      if (index > -1) {
        return customParam.possible_values_de[index];
      } else {
        return value; // Return the original value if no translation is found
      }
    });
    return translations;
  } else {
    return to_translate;
  }
};

// Main function to process auctions
export const processAuctions = async (
  auctions,
  folderChain,
  auctionSetName,
  ownerId
) => {
  const auctionIds = [];

  // Establish directory_location
  const directory_location = folderChain
    .filter((e) => e.id !== "root")
    .map((e) => e.name)
    .join("/");

  for (const auction of auctions) {
    // Prepare auction data
    const auctionData = {
      name: auction.nameBase,
      price_pln: auction.price_plnBase,
      price_euro: auction.price_euroBase,
      tags: auction.tagsBase,
      serial_numbers: auction.serial_numbersBase,
      photoset: auction.photosetBase,
      description: auction.descriptionBase,
      shipment_price: auction.shipment_priceBase,
      category: auction.categoryBase,
      amount: auction.amountBase,
      translated_params: auction.translatedParams,
    };

    // Create the auction
    const createdAuction = await addAuction(auctionData);
    const auctionId = createdAuction.id;
    auctionIds.push(auctionId);

    // Process customParams
    console.log("Processing custom params:", auction.customParams);
    const catCustomParams = await getCustomCategoryParameters(
      auction.categoryBase
    );

    for (const [allegro_id, value_name] of Object.entries(
      auction.customParams
    )) {
      if (value_name) {
        // Check if value_name is not empty
        // Check if the parameter exists
        let parameter = await getParameter(allegro_id);
        let customParam = null;
        // If the parameter is custom, fetch the parameter from the catCustomParams
        if (
          allegro_id.startsWith("custom_") &&
          catCustomParams !== null &&
          catCustomParams.length > 0
        ) {
          customParam = catCustomParams.find(
            (param) => `custom_${param.id}` === allegro_id
          );

          if (auction.translatedParams["de"] === undefined) {
            auction.translatedParams["de"] = {};
          }
          if (auction.translatedParams["de"]["custom"] === undefined) {
            auction.translatedParams["de"]["custom"] = {};
          }

          auction.translatedParams["de"]["custom"][customParam.name_de] =
            getCustomParamTranslations(customParam, value_name);

          console.log(
            "Custom parameter found:",
            customParam,
            "Value name:",
            value_name,
            "Translated value:",
            auction.translatedParams["de"]["custom"][customParam.name_de]
          );
        }

        if (!parameter) {
          if (customParam) {
            parameter = await addParameter(
              allegro_id,
              customParam.name_pl,
              customParam.parameter_type
            );
          }

          parameter = await addParameter(allegro_id);
        }
        const parameterId = parameter.id;

        // Prepare auction parameter data
        const auctionParameterData = {
          parameter: parameterId,
          value_name: Array.isArray(value_name)
            ? value_name.join("|")
            : value_name.toString(),
          value_id: 123,
          auction: auctionId,
        };

        // Create the auction parameter
        await addAuctionParameter(auctionParameterData);
      }
    }

    auctionData.translated_params = auction.translatedParams;
    updateAuction(auctionId, auctionData);
  }

  // Create the auction set
  const auctionSetData = {
    name: auctionSetName,
    directory_location: directory_location,
    auctions: auctionIds,
    owner: ownerId,
  };
  const createdAuctionSet = await addAuctionSet(auctionSetData);

  return createdAuctionSet;
};

export const downloadSheet = async (auctionSetId) => {
  try {
    const response = await api.get(`/download/auctionset/${auctionSetId}`, {
      responseType: "blob",
    });

    // Create a Blob from the response data
    const blob = new Blob([response.data], { type: response.data.type });
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a");
    link.href = url;

    // Set the default filename or extract from headers if available
    link.setAttribute("download", "auction_set.xlsx");

    // Append to the document and initiate download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading the sheet:", error);
    // Optionally, notify the user
  }
};

export const pushAuctionSetToBaselinker = async (auctionSetId) => {
  const response = await api.post(
    `/auctionsets/baselinker/upload/${auctionSetId}`
  );
  return response.data;
};

export const getAuctionSets = async () => {
  const response = await api.get("/auctionsets/");
  return response.data;
};

export const previewTags = async (categoryId, name, tags) => {
  const response = await api.post("/tag-preview/", {
    categoryId: categoryId,
    auctionName: name,
    auctionTags: tags,
  });
  return response.data;
};

export const performOCR = async (photoPath) => {
  // add timeout to prevent blocking
  const response = await api.post(
    "/api/perform-ocr/",
    {
      image_path: photoPath,
    },
    {
      timeout: 10000,
    }
  );
  return response.data;
};

const getGroupUsers = async (groupName) => {
  const response = await api.get(`/api/group-users/${groupName}`);
  return response.data;
};

export const getAvailableOwners = async () => {
  return getGroupUsers("owners");
};

export const moveAuctionPhotosToDoneDirectory = async (auctionId) => {
  const response = await api.get(`/api/complete-files/${auctionId}`);
  return response.data;
};

export const moveAuctionSetPhotosToDoneDirectory = async (auctionSetId) => {
  const response = await api.get(
    `/api/complete-auctionset-files/${auctionSetId}`
  );
  return response.data;
};

export const createDescriptionTemplate = async (name, content) => {
  const response = await api.post("/descriptiontemplate/", {
    name: name,
    content: content,
  });
  return response.data;
};

export const getCurrentUsersDescriptionTemplates = async () => {
  const response = await api.get("/descriptiontemplate/");
  return response.data;
};

export const getKeywordTranslations = async (keywords, language, category) => {
  try {
    const response = await api.post("/keyword-translation/search/", {
      keywords: keywords,
      language: language,
      category: category,
    });

    // The response data structure directly matches the expected frontend usage
    return response.data; // No need for further processing
  } catch (error) {
    console.error("Failed to fetch keyword translations:", error);
    throw error;
  }
};

export const saveKeywordTranslation = async (
  keyword,
  translation,
  language,
  category,
  shared
) => {
  try {
    const response = await api.post("/keywordtranslation/", {
      original: keyword,
      translated: translation,
      language,
      category,
      shared_across_categories: shared,
    });

    return response.data; // Return the created translation object
  } catch (error) {
    console.error("Failed to save keyword translation:", error);
    throw error;
  }
};

export const getFieldTranslationsDe = async (translateObject) => {
  console.log(translateObject);
  const response = await api.post("/api/translate/", {
    title: translateObject.name,
    description: translateObject.description,
    category: translateObject.category,
  });
  return response.data;
};

export const rotateImage = async (imagePath, degrees) => {
  const response = await api.post(`/api/image-rotate/`, {
    image_path: imagePath,
    angle: degrees,
  });
  return response.data;
};

export const getAllParameters = async () => {
  const response = await api.get("/distinct-parameters/");
  return response.data;
};

export const getAllAuctionParameters = async () => {
  const response = await api.get("/distinct-auction-parameters/");
  return response.data;
};

export async function saveTranslations(
  paramTranslations,
  auctionParamTranslations
) {
  // Convert paramTranslations { paramId: translation } into an array
  const paramTransArray = Object.entries(paramTranslations).map(
    ([paramId, translation]) => ({
      param_id: paramId,
      translation,
    })
  );

  // Convert auctionParamTranslations { paramId: { valueName: translation } } into an array
  const auctionParamTransArray = [];
  for (const [paramId, valueObj] of Object.entries(auctionParamTranslations)) {
    for (const [valueName, translation] of Object.entries(valueObj)) {
      auctionParamTransArray.push({
        param_id: paramId,
        value_name: valueName,
        translation,
      });
    }
  }

  const data = {
    param_translations: paramTransArray,
    auction_param_translations: auctionParamTransArray,
  };

  // POST this structured data
  const response = await api.post("/api/translations/save/", data);
  return response.data;
}

export async function fetchTranslations() {
  const response = await api.get("/api/translations/");
  return response.data;
}

export async function saveTranslationExamples(translation) {
  const response = await api.post("/translationexample/", translation);
  return response.data;
}

export async function fetchTranslationExamples(translation) {
  const response = await api.get("/translationexample/", translation);
  return response.data;
}

export async function updateTranslationExample(id, translation) {
  const response = await api.put(`/translationexample/${id}/`, translation);
  return response.data;
}

export async function deleteTranslationExample(id) {
  const response = await api.delete(`/translationexample/${id}/`);
  return response.data;
}

export const fetchTags = async (language = "pl") => {
  const response = await api.get(`/tags/?language=${language}`);
  return response.data;
};

export async function createTag(key, value, language = "pl") {
  const response = await api.post("/tags/", { key, value, language });
  return response.data;
}

export const removeTag = async (id, language = "pl") => {
  await api.delete(`/tags/${id}/?language=${language}`); // Ensure language is passed
};

export async function changeTag(id, value, language) {
  const response = await api.put(`/tags/${id}/?language=${language}`, {
    value,
  });
  return response.data;
}

export const fetchCategoryTags = async (language = "pl") => {
  const response = await api.get(`/category-tags/?language=${language}`);
  return response.data;
};

export const createCategoryTag = async (category_id, tags, language = "pl") => {
  await api.post("/category-tags/", { category_id, tags, language });
};

export const removeCategoryTag = async (id, language = "pl") => {
  await api.delete(`/category-tags/${id}/?language=${language}`);
};

export const changeCategoryTag = async (id, tags, language = "pl") => {
  await api.put(`/category-tags/${id}/?language=${language}`, { tags });
};

// Function to create a new custom category parameter
export const createCategoryParameter = async (data) => {
  const response = await api.post("/category-parameters/", data);
  return response.data;
};

// Function to retrieve custom parameters for a category
export const getCustomCategoryParameters = async (categoryId) => {
  const response = await api.get(
    `/category-parameters/?category_id=${categoryId}`
  );
  return response.data;
};

// Function to update an existing custom category parameter
export const updateCategoryParameter = async (id, data) => {
  const response = await api.put(`/category-parameters/${id}/`, data);
  return response.data;
};

// Function to delete a custom category parameter
export const deleteCategoryParameter = async (id) => {
  const response = await api.delete(`/category-parameters/${id}/`);
  return response.data;
};

export const fetchBaselinkerInventories = async () => {
  const response = await api.get(`/baselinker/inventories/`);
  return response.data;
};

export { api };
