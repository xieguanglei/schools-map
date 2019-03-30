import { jQuery as $, JEle } from "./jquery";


export class DialogManager {

    $dialog: JEle = $('#dialog');
    $input: JEle = this.$dialog.query('.input');
    $confirm: JEle = this.$dialog.query('.confirm');
    $cancel: JEle = this.$dialog.query('.cancel');
    $message: JEle = this.$dialog.query('.dialog-message');

    async prompt(message: string): Promise<string> {

        this.$message.text(message);
        this.$input.visible(true);
        this.$cancel.visible(true);

        return new Promise((resolve, reject) => {
            this.$dialog.visible(true);
            this.$confirm.click(() => {
                this.$dialog.visible(false);
                const value = this.$input.value();
                this.$input.value('');
                resolve(value);
            });
            this.$cancel.click(() => {
                this.$dialog.visible(false);
                this.$input.value('');
                resolve(null);
            });
        });
    }


    async confirm(message: string): Promise<boolean> {

        this.$message.text(message);
        this.$input.visible(false);
        this.$cancel.visible(true);

        return new Promise((resolve, reject) => {
            this.$dialog.visible(true);
            this.$confirm.click(() => {
                this.$dialog.visible(false);
                resolve(true);
            });
            this.$cancel.click(() => {
                this.$dialog.visible(false);
                resolve(false);
            });
        });

    }

    async alert(message: string): Promise<void> {

        this.$message.text(message);
        this.$input.visible(false);
        this.$cancel.visible(false);

        return new Promise((resolove, reject) => {
            this.$dialog.visible(true);
            this.$confirm.click(() => {
                this.$dialog.visible(false);
                resolove();
            });
            this.$cancel.click(() => { });
        });
    }

}





