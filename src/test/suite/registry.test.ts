import * as assert from 'assert';
import {getRegisteredTutorials, getDidactCategories, getTutorialsForCategory, getUriForDidactNameAndCategory, registerTutorial, clearRegisteredTutorials} from '../../utils';
import {before} from 'mocha';

const name = 'new-tutorial';
const category = 'some-category';
const source = 'my-uri';
const name2 = 'new-tutorial-2';
const category2 = 'some-category-2';
const source2 = 'my-uri-2';

suite('Didact registry test suite', () => {

	before('set up the registry tests', async () => {
		await clearRegisteredTutorials();
	});

	test('add to registry', async () => {
		try {
			await registerTutorial(name, source, category).then( () => {
				assert.ok('No errors thrown while creating new didact registry entry');
			});
		} catch (error) {
			assert.fail('We failed to create the new didact registry entry');
		}

		try {
			await registerTutorial(name, source, category);
			assert.fail('Should have been an error thrown while creating new didact registry entry twice');
		} catch (error) {
			assert.ok('As expected, we failed to create the new didact registry entry with a duplicated entry');
		}
	});

	test('make sure we get the registry', async() => {
		let registry = getRegisteredTutorials();
		assert.notEqual(registry, undefined);
	});

	test('verify can get categories', async () => {
		try {
			await registerTutorial(name2, source2, category2);
			assert.ok('No errors thrown while creating new didact registry entry for second category');
		} catch (error) {
			assert.fail('We failed to create the new didact registry entry for second category');
		}

		const cats : string[] = getDidactCategories();
		assert.notEqual(cats.indexOf(category), -1);
		assert.notEqual(cats.indexOf(category2), -1);
	});

	test('verify can get tutorials for category', async () => {
		const tuts : string[] = getTutorialsForCategory(category2);
		assert.notEqual(tuts.indexOf(name2), -1);
	});

	test('verify can get uri for name/category pair', async () => {
		const rtnUri : string | undefined = getUriForDidactNameAndCategory(name, category);
		assert.equal(rtnUri, source);
	});
});
