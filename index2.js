import fs from 'fs';
import {
	getAddress,
	getCertificate,
	getCertificateInfo,
	getCertificateRequest,
	getPEMFromPrivateKey,
	getPublicKey,
	verifyChain
} from "./utils.js";

const ethereumPrivateKey = '8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';
const caCert = 'root_ca.crt';
const caPriv = 'root_ca.key';

// Generate x.509 Certificate from Ethereum Account
const generateCertificate = async( name ) => {
	const pemPrivateKey = getPEMFromPrivateKey( ethereumPrivateKey );
	fs.writeFileSync( `${name}.key`, Buffer.from( pemPrivateKey ) );

	const certRequest = await getCertificateRequest( `${name}.key`, {
		country: 'MX',
		state: 'Mexico',
		location: 'Mexico',
		org: 'Test',
		unit: 'TS',
		cname: 'test.bid.org'
	} );
	fs.writeFileSync( `${name}.req`, Buffer.from( certRequest ) );

	const certificate = await getCertificate( `${name}.req`, caCert, caPriv );

	fs.writeFileSync( `${name}.crt`, Buffer.from( certificate ) );
}

// Validate x.509 Certificate and Extracts Info
const validateCertificate = async( name ) => {
	const root = fs.readFileSync( caCert );
	const cert = fs.readFileSync( `${name}.crt` );

	const isValidChain = await verifyChain( cert, root );
	const info = await getCertificateInfo( cert );
	const publicKey = await getPublicKey( cert );
	const address = getAddress( publicKey );

	console.log( 'isValidChain:', isValidChain );
	console.log( 'info:', info );
	console.log( 'publicKey:', publicKey );
	console.log( 'address:', address );
}

( async() => {
	await generateCertificate( 'test' );
	await validateCertificate( 'test' );
} )();