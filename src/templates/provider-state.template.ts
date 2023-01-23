import * as changeCase from "change-case";

export function getProviderStateTemplate(
    providerName: string
): string {
    return getEquatableProviderStateTemplate(providerName);
}

function getEquatableProviderStateTemplate(providerName: string): string {
    const pascalCaseProviderName = changeCase.pascalCase(providerName);
    const snakeCaseProviderName = changeCase.snakeCase(providerName);
    return `part of '${snakeCaseProviderName}_provider.dart';
class ${pascalCaseProviderName}State extends Equatable {
  const ${pascalCaseProviderName}State();

  @override
  List<Object?> get props => [];
}
`;
}