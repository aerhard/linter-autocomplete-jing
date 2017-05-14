
import requestValidation from './requestValidation';

const validate = (textEditor, config) => ([, localConfig]) =>
  requestValidation(textEditor, config, localConfig);

export default validate;
