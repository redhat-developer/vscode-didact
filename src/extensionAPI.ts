import { DEFAULT_TUTORIAL_CATEGORY, DEFAULT_TUTORIAL_NAME, DEFAULT_TUTORIAL_PROVIDER_ID } from "./extension";
import { ITutorial, Tutorial } from "./utils";

export interface TutorialAPI {
    registerTutorialProvider(tutorialProvider: TutorialProvider): boolean;
    getAllTutorialProviders(): TutorialProvider[];
    getTutorialProviderById(providerId: string): TutorialProvider | undefined;
}

class DidactTutorialAPI implements TutorialAPI {
    
    private _registeredProviders: TutorialProvider[] = [];

    public registerTutorialProvider(tutorialProvider: TutorialProvider): boolean {
        if (this._registeredProviders.indexOf(tutorialProvider)===-1) {
            this._registeredProviders.push(tutorialProvider);
            console.log("Registered new tutorial contributor: " + tutorialProvider.getId());
        }
        return true;
    }

    public getAllTutorialProviders(): TutorialProvider[] {
        return this._registeredProviders;
    }

    public getTutorialProviderById(providerId: string): TutorialProvider | undefined {
        for (const provider of this._registeredProviders) {
            if (provider.getId() === providerId) {
                return provider;
            }
        }
        return undefined;
    }
}

export interface TutorialProvider {
    getId(): string;
    getTutorials(): ITutorial[];
    getUriForTutorialByCategoryAndName(category: string, name: string): string | undefined;
    getUriForTutorial(tutorial: ITutorial): string | undefined;
}

class DidactTutorialProvider implements TutorialProvider {
    
    private _embeddedTutorials: ITutorial[] = [];
    private _tutorialUriMap: Map<ITutorial, string> = new Map();
    
    constructor() {
        this.registerTutorial(new Tutorial(this.getId(), DEFAULT_TUTORIAL_NAME, DEFAULT_TUTORIAL_CATEGORY), './demos/markdown/didact-demo.didact.md');
        this.registerTutorial(new Tutorial(this.getId(), 'Create a New Didact Tutorial Extension', DEFAULT_TUTORIAL_CATEGORY), './create_extension/create-new-tutorial-with-extension.didact.md');
        this.registerTutorial(new Tutorial(this.getId(), 'HelloWorld with JavaScript in Three Steps', DEFAULT_TUTORIAL_CATEGORY), './demos/markdown/helloJS/helloJS.didact.md');
        this.registerTutorial(new Tutorial(this.getId(), 'Writing Your First Didact Tutorial', DEFAULT_TUTORIAL_CATEGORY), './demos/markdown/tutorial/tutorial.didact.md');
    }    

    public registerTutorial(tutorial: ITutorial, tutorialUri: string): void {
        this._embeddedTutorials.push(tutorial);
        this._tutorialUriMap.set(tutorial, tutorialUri);
    }

    public getId(): string {
        return DEFAULT_TUTORIAL_PROVIDER_ID;
    }

    public getTutorials(): ITutorial[] {
        return this._embeddedTutorials;
    }

    public getUriForTutorialByCategoryAndName(category: string, name: string): string | undefined {
        for (const tutorial of this._embeddedTutorials) {
            if (tutorial.category === category && tutorial.name === name) {
                return this.getUriForTutorial(tutorial);
            }
        }
    }

    public getUriForTutorial(tutorial: ITutorial): string | undefined {
        if (this._tutorialUriMap.has(tutorial)) {
            return this._tutorialUriMap.get(tutorial);
        }
        return undefined;
    }
}

export { DidactTutorialAPI, DidactTutorialProvider };
