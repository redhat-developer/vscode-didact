import * as path from 'path';
import * as cp from 'child_process';
import { downloadAndUnzipVSCode, resolveCliPathFromVSCodeExecutablePath, runTests } from 'vscode-test';

async function main() {

	const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
	const extensionTestsPath = path.resolve(__dirname, './suite');

	// always start with an empty workspace using a temp folder
	const testWorkspace = path.resolve(__dirname, '../../test Fixture with speci@l chars');
	console.log('Test workspace: ' + testWorkspace);

	const vscodeExecutablePath : string = await downloadAndUnzipVSCode('stable');
	console.log(`vscodeExecutablePath = ${vscodeExecutablePath}`);

	const cliPath: string = resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath);
	installExtraExtension(cliPath, 'redhat.vscode-commons');

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

function installExtraExtension(cliPath: string, extensionId: string) {
	cp.spawnSync(cliPath, ['--install-extension', extensionId, '--force'], {
		encoding: 'utf-8',
		stdio: 'inherit'
	});
	console.log(`VS Code extension ${extensionId} installed`);
}

main();
