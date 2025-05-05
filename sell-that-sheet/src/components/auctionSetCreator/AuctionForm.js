import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Spinner,
  Textarea,
  Checkbox,
  CheckboxGroup,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  useDisclosure,
} from "@chakra-ui/react";
import { EditIcon, ChatIcon } from "@chakra-ui/icons";
import { ToastContainer, toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import WindowedSelect from "react-windowed-select";
import {
  createCategoryOfferObject,
  previewTags,
  getCurrentUsersDescriptionTemplates,
  createDescriptionTemplate,
  getKeywordTranslationsDe,
  getCustomCategoryParameters,
} from "contexts/AuthContext";
import AuctionList from "components/auctionSetCreator/AuctionList";
import DescriptionTemplateModal from "components/auctionSetCreator/DescriptionTemplateModal";
import KeywordTranslationModal from "components/auctionSetCreator/KeywordTranslationModal";
import FieldTranslationModal from "components/auctionSetCreator/FieldTranslationModal";

// API function to fetch category parameters
const fetchCategoryParameters = async (categoryId) => {
  try {
    const response = await createCategoryOfferObject(categoryId);
    return response;
  } catch (error) {
    console.error("Failed to fetch category parameters", error);
    return [];
  }
};

// Chakra UI-compatible Formik Field
const ChakraField = ({ label, children, disabled, ...props }) => (
  <FormControl isInvalid={props.touched && props.error} mb={2}>
    <FormLabel size={disabled ? "xs" : "md"} margin={0} htmlFor={props.name}>
      {label}
    </FormLabel>
    {children}
    <FormErrorMessage>{props.error}</FormErrorMessage>
  </FormControl>
);

const AuctionForm = ({
  categoryId,
  offerObject,
  auctions,
  setAuctions,
  resetFileBrowserView,
  auctionTranslations,
  setAuctionTranslations,
}) => {
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [newAuctionData, setNewAuctionData] = useState(null);
  const [titleCounter, setTitleCounter] = useState(0);
  const [currentAuctionName, setCurrentAuctionName] = useState("");
  const [currentAuctionTags, setCurrentAuctionTags] = useState("");
  const [descriptionTemplates, setDescriptionTemplates] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const {
    isOpen: isFieldTranslationModalOpen,
    onOpen: openFieldTranslationModal,
    onClose: closeFieldTranslationModal,
  } = useDisclosure();
  const [externalSetFieldValue, setExternalSetFieldValue] = useState(null);
  const [currentFormikValues, setCurrentFormikValues] = useState({});

  // Helper to transform a custom param record into our form-field shape
  const mapCustomParam = (p) => {
    const isList =
      p.parameter_type === "single" || p.parameter_type === "multi";
    return {
      id: `custom_${p.id}`,
      name: `custom_${p.id}`, // must match Formik name
      displayName: p.name_pl, // label in Polish
      base: false, // treated as customParams
      value: "", // initial
      required: false,
      disabled: false,
      type: isList
        ? "dictionary" // renders as select or checkboxes
        : p.parameter_type === "numeric"
        ? "float"
        : "string",
      restrictions: {
        multipleChoices: p.parameter_type === "multi",
      },
      dictionary: isList
        ? p.possible_values_pl.map((val, idx) => ({ id: idx, value: val }))
        : [],
    };
  };

  useEffect(() => {
    if (categoryId === null) {
      return;
    }
    const loadFormFields = async () => {
      // 1) fetch Allegro/base fields
      const baseFields = await createCategoryOfferObject(categoryId);
      // 2) fetch YOUR custom fields
      const customParams = await getCustomCategoryParameters(categoryId);
      const mappedCustom = customParams.map(mapCustomParam);

      // 3) merge and set
      const allFields = [...baseFields, ...mappedCustom];
      setFormFields(allFields);
      setNewAuctionData(allFields);
      setLoading(false);
    };
    loadFormFields();
  }, [categoryId, offerObject]);

  const handleSingleFieldTranslation = (field, text, fieldType) => {
    if (fieldType === "title") {
      console.log("Translating field:", field, text);
    }
  };

  const buildValidationSchema = (fields) => {
    const schemaFields = {};
    fields.forEach((field) => {
      let validator = Yup.string();

      if (field.type === "float") {
        validator = Yup.number().typeError("Must be a number");
        if (field.restrictions?.min !== undefined) {
          validator = validator.min(
            field.restrictions.min,
            `Minimalna wartość: ${field.restrictions.min}`
          );
        }
        if (field.restrictions?.max !== undefined) {
          validator = validator.max(
            field.restrictions.max,
            `Maksymalna wartość: ${field.restrictions.max}`
          );
        }
      }

      if (field.type === "string") {
        validator = Yup.string();
        if (field.restrictions?.minLength !== undefined) {
          validator = validator.min(
            field.restrictions.minLength,
            `Minimalna długość: ${field.restrictions.minLength}`
          );
        }
        if (field.restrictions?.maxLength !== undefined) {
          validator = validator.max(
            field.restrictions.maxLength,
            `Maksymalna długość: ${field.restrictions.maxLength}`
          );
        }
      }

      if (field.type === "dictionary" && field.restrictions?.multipleChoices) {
        validator = Yup.array().of(Yup.string());
      }

      const notRequiredOverload = "Numer";

      if (field.required && !field.name.includes(notRequiredOverload)) {
        validator = validator.required(
          `Pole ${field.displayName || field.name} jest wymagane`
        );
      }

      schemaFields[field.name] = validator;
    });
    return Yup.object().shape(schemaFields);
  };

  const getInitialValues = (fields, selectedAuctionData, newAuctionData) => {
    return fields.reduce((values, field) => {
      if (selectedAuctionData) {
        values[field.name] =
          selectedAuctionData[field.id] ||
          selectedAuctionData.customParams[field.id] ||
          "";
      } else if (newAuctionData) {
        values[field.name] =
          newAuctionData.find((e) => e.id === field.id)?.value || "";
        if (field.id === "descriptionBase") {
          values[field.name] =
            "<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>";
        }
        const defaultValue = selectDefaultValue(field.name);
        if (defaultValue !== null) {
          values[field.name] = defaultValue;
          if (
            field.type === "dictionary" &&
            field.restrictions?.multipleChoices
          ) {
            values[field.name] = defaultValue || [];
          }
        }
      } else {
        values[field.name] = "";
      }
      return values;
    }, {});
  };

  const validationSchema = buildValidationSchema(formFields);

  function removeOpeningAndTrailingBr(input) {
    return input.replace(
      /^(<br\s*\/?>|<p>\s*<br\s*\/?>\s*<\/p>)+|(<br\s*\/?>|<p>\s*<br\s*\/?>\s*<\/p>)+$/gi,
      ""
    );
  }

  const handleFormSubmit = (values, actions) => {
    const auction = {
      customParams: {},
      id: auctions.length + 1,
      translatedParams: auctionTranslations,
    };

    formFields.forEach((field) => {
      if (field.base) {
        if (field.id === "descriptionBase") {
          auction[field.id] = removeOpeningAndTrailingBr(values[field.name]);
        } else {
          auction[field.id] = values[field.name];
        }
      } else {
        auction.customParams[field.id] = values[field.name];
      }
    });

    console.log("Auction:", auction);

    if (selectedAuction !== null) {
      const updatedAuctions = auctions.map((a, idx) =>
        idx === selectedAuction ? auction : a
      );
      setAuctions(updatedAuctions);
    } else {
      setAuctions([...auctions, auction]);
    }
    actions.setSubmitting(false);
    actions.resetForm();
    setSelectedAuction(null);
    resetFileBrowserView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyFieldTranslations = (translations, targetLang) => {
    auctionTranslations[targetLang] = translations;
  };

  const handleEditAuction = (auctionId) => {
    setSelectedAuction(
      auctions.findIndex((auction) => auction.id === auctionId)
    );
  };

  const confirmAction = (action) => {
    return window.confirm(action);
  };

  const handleRemoveAuction = (auctionId) => {
    if (!confirmAction("Czy na pewno chcesz usunąć tę aukcję?")) {
      return;
    }
    const updatedAuctions = auctions.filter(
      (auction, _) => auction.id !== auctionId
    );
    setAuctions(updatedAuctions);
    setSelectedAuction(null);
  };

  const selectDefaultValue = (fieldName) => {
    switch (fieldName) {
      case "Wersja":
        return "Europejska";
      case "Typ samochodu":
        return ["4x4/SUV", "Samochody osobowe"];
      case "amount":
        return 1;
      case "Stan":
        return "Używany";
      case "Jakość części (zgodnie z GVO)":
        return "Q - oryginał z logo producenta części (OEM, OES)";
      case "Rodzaj lampy":
        return "dedykowana";
      case "description":
        return "<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>";
      default:
        return null;
    }
  };

  const loadDescriptionTemplate = async () => {
    try {
      const templates = await getCurrentUsersDescriptionTemplates();
      setDescriptionTemplates(templates);
      if (templates.length > 0) {
        onOpen(); // Opens the modal for user to select a template
      } else {
        alert("No templates available.");
      }
    } catch (error) {
      console.error("Failed to load description templates", error);
      alert("Error loading description templates.");
    }
  };

  const saveDescriptionTemplate = async (templateName, content) => {
    try {
      if (!templateName.trim()) {
        toast.error("Nazwa szablonu nie może być pusta");
        return;
      }
      await createDescriptionTemplate(templateName, content);
      toast.success("Szablon zapisany pomyślnie");
    } catch (error) {
      console.error("Failed to save description template", error);
      toast.error("Błąd zapisu szablonu");
    }
  };

  const prepareKeywordTranslation = (text) => {
    const words = text
      .split(" ")
      .filter((word) => word.length >= 3 && /^(?!\d+$).+$/.test(word)) // Valid keywords
      .filter((value, index, self) => self.indexOf(value) === index); // Unique keywords

    setKeywords(words); // Set keywords to pass to the modal
    setIsTranslationModalOpen(true); // Open modal
  };

  const wrapComponent = (field, component, setFieldValue, values) => {
    if (field.id === "nameBase") {
      const handleChange = (event) => {
        setTitleCounter(event.target.value.length);
        setCurrentAuctionName(event.target.value);
        component.props.onChange(event);
      };

      return (
        <InputGroup>
          {React.cloneElement(component, {
            onChange: handleChange,
          })}
          <InputRightAddon>{titleCounter}</InputRightAddon>
          <InputRightAddon>
            <Button
              size="xs"
              onClick={(e) => {
                e.preventDefault();
                prepareKeywordTranslation(values[field.name]);
              }}
            >
              <EditIcon />
            </Button>
            <Button
              size="xs"
              ml={2}
              onClick={(e) => {
                e.preventDefault();
                handleSingleFieldTranslation(
                  field,
                  values[field.name],
                  "title"
                );
              }}
            >
              <ChatIcon />
            </Button>
          </InputRightAddon>
        </InputGroup>
      );
    }

    if (field.id === "tagsBase") {
      const handleChange = (event) => {
        setCurrentAuctionTags(event.target.value);
        component.props.onChange(event);
      };

      const handleClick = () => {
        const res = previewTags(
          categoryId,
          currentAuctionName,
          currentAuctionTags
        );
        res.then((value) => {
          alert(value);
        });
      };

      return (
        <InputGroup size="md">
          {React.cloneElement(component, {
            onChange: handleChange, // Add event handling to the component
          })}
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              Podgląd
            </Button>
          </InputRightElement>
        </InputGroup>
      );
    }

    return component;
  };

  return (
    <Box display="grid" gridGap={2} gridAutoFlow="column dense">
      <Box p={4}>
        {loading ? (
          <Spinner />
        ) : (
          <Formik
            initialValues={getInitialValues(
              formFields,
              auctions[selectedAuction],
              newAuctionData
            )}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={handleFormSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => {
              setExternalSetFieldValue(() => setFieldValue);
              setCurrentFormikValues(values);

              return (
                <Form>
                  {formFields.map((field) => (
                    <Field key={field.id} name={field.name}>
                      {({ field: formikField, form: { errors, touched } }) => (
                        <ChakraField
                          label={field.displayName || field.name}
                          name={formikField.name}
                          touched={touched[formikField.name]}
                          error={errors[formikField.name]}
                          disabled={field.disabled}
                        >
                          {field.type === "dictionary" &&
                          field.restrictions?.multipleChoices ? (
                            <CheckboxGroup
                              value={values[field.name] || []} // Ensure the field value is an array for multiple choices
                              onChange={(selectedValues) =>
                                setFieldValue(field.name, selectedValues)
                              }
                            >
                              {field.dictionary.map((option) => (
                                <Checkbox
                                  mr={6}
                                  key={option.id}
                                  value={option.value}
                                  isDisabled={field.disabled}
                                >
                                  {option.value}
                                </Checkbox>
                              ))}
                            </CheckboxGroup>
                          ) : field.id === "tagsBase" ? (
                            wrapComponent(
                              field,
                              <Textarea
                                {...formikField}
                                disabled={field.disabled}
                                size={field.disabled ? "xs" : "md"}
                              />
                            )
                          ) : field.type === "dictionary" &&
                            !field.restrictions?.multipleChoices ? (
                            <WindowedSelect
                              value={
                                values[field.name]
                                  ? {
                                      value: values[field.name],
                                      label: values[field.name],
                                    }
                                  : null
                              }
                              onChange={(selectedOption) =>
                                setFieldValue(
                                  field.name,
                                  selectedOption ? selectedOption.value : ""
                                )
                              }
                              options={field.dictionary.map((option) => ({
                                value: option.value,
                                label: option.value,
                              }))}
                              isDisabled={field.disabled}
                              placeholder="Wybierz z listy"
                            />
                          ) : field.type === "textarea" ? (
                            <>
                              <InputGroup>
                                <Button
                                  size="xs"
                                  onClick={() =>
                                    loadDescriptionTemplate(
                                      setFieldValue,
                                      field.name
                                    )
                                  }
                                  colorScheme="blue"
                                >
                                  Wczytaj Szablon
                                </Button>
                                <Button
                                  size="xs"
                                  onClick={() => {
                                    const templateName = prompt(
                                      "Podaj nazwę szablonu:"
                                    );
                                    if (templateName)
                                      saveDescriptionTemplate(
                                        templateName,
                                        values[field.name]
                                      );
                                  }}
                                  colorScheme="blue"
                                >
                                  Zapisz Szablon
                                </Button>
                              </InputGroup>
                              <ReactQuill
                                // value={values[field.name]}
                                // make sure the value updates when the form value changes
                                value={values[field.name]}
                                onChange={(content) =>
                                  setFieldValue(field.name, content)
                                }
                                readOnly={field.disabled}
                                theme="snow"
                              />
                            </>
                          ) : (
                            wrapComponent(
                              field,
                              <Input
                                {...formikField}
                                disabled={field.disabled}
                                type={
                                  field.type === "float" ? "number" : "text"
                                }
                                size={field.disabled ? "xs" : "md"}
                                step={
                                  field.type === "float" &&
                                  field.restrictions?.precision
                                    ? Math.pow(
                                        10,
                                        -field.restrictions.precision
                                      )
                                    : undefined
                                }
                              />,
                              setFieldValue,
                              values
                            )
                          )}
                        </ChakraField>
                      )}
                    </Field>
                  ))}
                  <Button
                    variant="outline"
                    colorScheme="orange"
                    mr={3}
                    onClick={openFieldTranslationModal}
                  >
                    Tłumacz wszystkie pola
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isSubmitting}
                  >
                    {selectedAuction !== null
                      ? "Popraw Aukcję"
                      : "Dodaj Aukcję"}
                  </Button>
                  <DescriptionTemplateModal
                    isOpen={isOpen}
                    onClose={onClose}
                    templates={descriptionTemplates}
                    setFieldValue={setFieldValue}
                    fieldName="description"
                  />
                  <KeywordTranslationModal
                    isOpen={isTranslationModalOpen}
                    onClose={() => setIsTranslationModalOpen(false)}
                    keywords={keywords}
                    category={categoryId}
                  />
                  <FieldTranslationModal
                    isOpen={isFieldTranslationModalOpen}
                    onClose={closeFieldTranslationModal}
                    fields={formFields}
                    currentValues={values}
                    category={categoryId}
                    onApplyTranslations={handleApplyFieldTranslations}
                  />
                </Form>
              );
            }}
          </Formik>
        )}
      </Box>
      <Box p={4}>
        <AuctionList
          selectedAuction={auctions[selectedAuction]?.id}
          auctions={
            categoryId === -1
              ? auctions
              : auctions.filter((e) => e.categoryBase == categoryId)
          }
          onEditAuction={handleEditAuction}
          onRemoveAuction={handleRemoveAuction}
        />
      </Box>
    </Box>
  );
};

export default AuctionForm;
