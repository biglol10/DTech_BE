interface metadataStorageObj {
	status: string;
	metadata_title: string | undefined;
	metadata_description: string | undefined;
	metadata_image: string | undefined;
}

interface metadataStorage {
	[name: string]: metadataStorageObj;
}

const metadataStorage: metadataStorage = {};

export { metadataStorage };
