import * as changeCase from "change-case";

export function getProviderTemplate(providerName: string): string {
  return getEquatableProviderTemplate(providerName);
}

function getEquatableProviderTemplate(providerName: string) {
  const pascalCaseProviderName = changeCase.pascalCase(providerName);
  const snakeCaseProviderName = changeCase.snakeCase(providerName);
  const providerState = `${pascalCaseProviderName}State`;
  return `import 'package:equatable/equatable.dart';
part '${snakeCaseProviderName}_state.dart';
class ${pascalCaseProviderName}Provider extends ChangeNotifierWrapper<${providerState}> {
  ${pascalCaseProviderName}Provider() : super(${providerState}());
}
`;
}