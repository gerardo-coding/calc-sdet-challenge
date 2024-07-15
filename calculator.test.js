import { exec } from 'child_process';
import {execSync} from 'child_process';
import { expect } from 'chai';
import data from './testdata.json' assert { type: 'json' };

const ERROR_INPUT_PARAMS = "Usage: cli-calculator operation operand1 operand2 Supported operations: add, subtract, multiply, divide";
const ERROR_INVALID_NUMBER = "Invalid argument. Must be a numeric value.";
const ERROR_INVALID_OPERATION = "Error: Unknown operation:";

/**
 * Performs the calculation using the CLI calculator
 * @param {run} operation the arithmetic operation to perform (add, subtract, multiply, divide)
 * @param {*} num1 the first number
 * @param {*} num2 the second number
 * @returns output of the command
 */
function performCalculation(operation, num1, num2) {
    return new Promise((resolve, reject) => {
        const command = `docker run --rm public.ecr.aws/l4q9w4c5/loanpro-calculator-cli ${operation} ${num1} ${num2}`;
        try{
            exec(command, (error, stdout, stderr) => {
                resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
            });
        }catch(error){
            console.log(error);
        }
        
    });
}

/**
 * Normalize the output by removing new lines and extra spaces
 * @param {*} output 
 * @returns the normalized output
 */
function normalizeOutput(output) {
    return output.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g, ' ').trim();
}

describe('Testing CLI Arithmetic Calculator', () => {

    // Test cases for all the arithmetic operations. Data is loaded from testdata.json
    for(const {id, operation, num1 , num2 ,result } of data) {
        it(`TC[${id}]: should ${operation} ${num1} and ${num2} to get ${result}`, async () => {
            const { stdout } = await performCalculation(operation, num1, num2);
            expect(stdout).to.equal(result.toString());
        });
    }

    // Test cases for invalid inputs
    it('should return an error when only one number is provided', async () => {
        const command = "docker run --rm public.ecr.aws/l4q9w4c5/loanpro-calculator-cli add 3";
        const result  = execSync(command).toString();
        const normalizedResult = normalizeOutput(result);
        expect(normalizedResult).to.equal(ERROR_INPUT_PARAMS);
    });

    it('should return an error when more than two numers are provided', async () => {
        const command = "docker run --rm public.ecr.aws/l4q9w4c5/loanpro-calculator-cli add 3 6 7";
        const result  = execSync(command).toString();
        const normalizedResult = normalizeOutput(result);
        expect(normalizedResult).to.equal(ERROR_INPUT_PARAMS);
    });

    it('should return an error an invalid operation is provided', async () => {
        const command = "docker run --rm public.ecr.aws/l4q9w4c5/loanpro-calculator-cli restore 3 6";
        const result  = execSync(command).toString();
        const normalizedResult = normalizeOutput(result);
        expect(normalizedResult).to.equal(`${ERROR_INVALID_OPERATION} restore`);
    });

    it('should return an error when onde of the parameters is not a number', async () => {
        const { stdout } = await performCalculation('add', 't', '6');
        expect(stdout).to.equal(ERROR_INVALID_NUMBER);
    });
});