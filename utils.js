import pem from "pem";
import Wallet from "ethereumjs-wallet";
import EthUtil from "ethereumjs-util";
import KeyEncoder from "key-encoder";
import util from "util";
import { exec as exec0 } from "child_process";

const exec = util.promisify( exec0 );

export function verifyChain( cert, root ) {
	return new Promise( ( resolve, reject ) => {
		pem.verifySigningChain( cert, root, ( err, result ) => {
			if( err ) return reject( err );
			resolve( result );
		} );
	} );
}

export function getPublicKey( cert ) {
	return new Promise( ( resolve, reject ) => {
		pem.getPublicKey( cert, ( err, result ) => {
			if( err ) return reject( err );
			const base64 = result.publicKey.replace( '-----BEGIN PUBLIC KEY-----\n', '' )
				.replace( '-----END PUBLIC KEY-----', '' )
				.replace( '\n', '' );
			const hex = new Buffer( base64, 'base64' ).toString( 'hex' );
			const publicKey = hex.slice( -128 );
			resolve( `0x${publicKey}` );
		} );
	} );
}

export function getAddress( publicKey ) {
	const publicKeyBuffer = EthUtil.toBuffer( publicKey );
	const wallet = Wallet.default.fromPublicKey( publicKeyBuffer );
	return `0x${wallet.getAddress().toString( 'hex' )}`;
}

export function getCertificateInfo( cert ) {
	return new Promise( ( resolve, reject ) => {
		pem.readCertificateInfo( cert, ( err, result ) => {
			if( err ) return reject( err );
			resolve( result );
		} );
	} );
}

export function getPEMFromPrivateKey( privateKey = "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63" ) {
	const keyEncoder = new KeyEncoder.default( 'secp256k1' );
	const pemPrivateKey = keyEncoder.encodePrivate( privateKey, 'raw', 'pem' )
	return pemPrivateKey;
}

export function getCertificateRequest( keyFile, { country, state, location, org, unit, cname } ) {
	return new Promise( async( resolve, reject ) => {
		const { stdout, stderr } = await exec( `openssl req -new -sha256 -key ${keyFile} -subj "/C=${country}/ST=${state}/L=${location}/O=${org}/OU=${unit}/CN=${cname}" -days 365` );
		if( stderr ) return reject( stderr );
		resolve( stdout );
	} );
}

export function getCertificate( reqFile, caCert, caKey ) {
	return new Promise( async( resolve, reject ) => {
		const { stdout, stderr } = await exec( `openssl x509 -req -in ${reqFile} -CA ${caCert} -CAkey ${caKey} -CAcreateserial -days 365 -sha256` );
		if( stderr && stderr.indexOf( "Signature ok" ) < 0 ) return reject( stderr );
		resolve( stdout );
	} );
}
