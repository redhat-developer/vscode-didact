import * as path from 'path';
import { downloadAndUnzipVSCode, runTests } from 'vscode-test';

async function main() {

	const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
	const extensionTestsPath = path.resolve(__dirname, './suite/index');

	// always start with an empty workspace using a temp folder
	const testWorkspace = path.resolve(__dirname, '../../test Fixture with speci@l chars');
	console.log('Test workspace: ' + testWorkspace);

	const vscodeExecutablePath : string = await downloadAndUnzipVSCode('stable');
	console.log(`vscodeExecutablePath = ${vscodeExecutablePath}`);

	try {
		await runTests({ 
			vscodeExecutablePath: `${vscodeExecutablePath}`,
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace, '--disable-extensions']
		});
		
	} catch (err) {
		console.error(err);
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
